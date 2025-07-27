# Kamailio + Asterisk: SIP Proxy Setup for BT Home Hub

This setup allows a SIP device to register to `btsip.bt.com` (via DNS spoofing), bypass SIP authentication using **Kamailio**, and forward all call traffic to **Asterisk** for full RTP/audio/media handling.

All of the required code blocks are in this `README.md` or alternatively you can check out `kamailio.cfg` and `sip.conf` for asterisk for the required commands, though the README is more detailed and better if you want to understand the process.

---

## 📡 DNS Spoofing `btsip.bt.com`

Ensure your BT Home Hub resolves `btsip.bt.com` to your Kamailio server, you can use a DNS server to point your Zone to the correct IP.

---

## ⚙️ Kamailio Configuration

Edit the main config:

```bash
sudo nano /etc/kamailio/kamailio.cfg
```

### Accept Any SIP REGISTER

Locate the `request_route` block and add:

```c
if (is_method("REGISTER")) {
    save("location");
    exit;
}
```

### Forward INVITE to Asterisk

Below or near the REGISTER block:

```c
if (is_method("INVITE")) {
    forward(192.168.1.101, 5060);  # Asterisk IP
    exit;
}
```

Restart Kamailio:

```bash
sudo systemctl restart kamailio
```

---

## 📞 Asterisk Configuration

Edit `sip.conf`:

```ini
[general]
context=public
allowguest=yes
udpbindaddr=0.0.0.0

[from-kamailio]
type=friend
host=192.168.1.100       ; Kamailio IP
insecure=invite,port
context=from-external
```

Edit `extensions.conf`:

```ini
[from-external]
exten => _X.,1,NoOp(Call from Kamailio)
 same => n,Dial(SIP/1001)
 same => n,Hangup()
```

Restart Asterisk:

```bash
sudo systemctl restart asterisk
```

Access Asterisk CLI:

```bash
sudo asterisk -rvvvvv
```

Enable SIP debugging:

```bash
sip set debug on
```

---

## Diagram of communication flow


```
[BT Hub]   <-- REGISTER --> [Kamailio] <-- (internal routing) --> [Asterisk]
           <-- 200 OK <--                                     --> (no password needed)
        
[BT Hub] <-- INVITE  --> [Kamailio] <-- INVITE              --> [Asterisk]
         <-- 200 OK  <--                                    <-- 200 OK
         <-- ACK     <--                                    <-- ACK
```

## Flow Explanation

### ✍ REGISTER Flow
 - BT Hub sends a `REGISTER` request to btsip.bt.com (spoofed to Kamailio).

 - Kamailio receives the `REGISTER`, ignores authentication, and stores the contact in its location table. 

- **(Optional)** *Kamailio can forward this registration data to Asterisk as well but in our setup it does not need to.*

- Kamailio replies `200 OK` to the Hub — registration is now considered successful.

### 🔹 INVITE Call Flow
- The Hub now sends an `INVITE`.

- Kamailio receives the `INVITE`, looks up the contact or route, and forwards it to Asterisk.

 - Asterisk responds with:

`100 Trying` (optional)

`180 Ringing`

`200 OK` — which includes SDP/ATP (audio negotiation info)

- Kamailio forwards the `200 OK` back to the Hub.

- The Hub then replies with `ACK`, which Kamailio again forwards to Asterisk.

At this point, the call is _established_ and RTP/audio begins directly between the BT Hub and Asterisk. Kamailio is no longer in the media path.

## ✅ Flow Summary

| Step | Action                               | Component |
| ---- | ------------------------------------ | --------- |
| 1    | Hub sends REGISTER to `btsip.bt.com` | Kamailio  |
| 2    | Kamailio accepts without auth        | Kamailio  |
| 3    | Hub sends INVITE                     | Kamailio  |
| 4    | Kamailio forwards INVITE             | Asterisk  |
| 5    | Asterisk handles call + RTP          | Asterisk  |

---

