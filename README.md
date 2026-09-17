
<div align="center"># 🎯 HostSniper### Advanced Reverse IP Lookup & Domain Intelligence Tool![Version](https://img.shields.io/badge/version-1.0.0-blue)![License](https://img.shields.io/badge/license-MIT-green)![OSINT](https://img.shields.io/badge/OSINT-Recon-orange)[English](#-overview) | [فارسی](#-معرفی-فارسی)</div>---## 🇬🇧 Overview**HostSniper** is a powerful all-in-one **Reverse IP Lookup and OSINT reconnaissance** tool. Simply provide an IP address or domain name, and HostSniper will discover all domains hosted on the same server, then perform deep intelligence gathering on each target.### ⚡ Key Features| Feature | Description ||---------|-------------|| 🎯 **Reverse IP Lookup** | Find all domains sharing the same server || 📡 **Mass Ping** | Check live status and latency of discovered domains || 🔒 **SSL/TLS Analyzer** | Inspect SSL certificates, expiration, and issuer info || 🕵️ **WHOIS Extraction** | Fetch domain registration and ownership data || 🧬 **DNS Records** | Retrieve NS, A, MX, CNAME, and TXT records || ⚙️ **Lightweight** | Fast enumeration with minimal dependencies |### 🚀 Installation
bash
git clone https://github.com/YOUR_USERNAME/HostSniper.git
cd HostSniper
Install dependencies (if any)
pip install -r requirements.txt
123456789101112
### 💻 Usage```bash# Scan by IP addresspython hostsniper.py --target 192.168.1.1# Scan by domainpython hostsniper.py --target example.com# Full recon mode (SSL + WHOIS + DNS)python hostsniper.py --target example.com --full
📋 Example Output
1234567
[*] Target: example.com[*] Server IP: 93.184.216.34[*] Found 12 domains on this server[+] domain1.com    | Ping: 45ms  | SSL: Valid  | NS: ns1.example.com[+] domain2.net    | Ping: 62ms  | SSL: Expired | NS: ns2.example.com...
🛠️ Use Cases
OSINT & Information Gathering
Bug Bounty Reconnaissance
Server Security Auditing
Network Mapping
🇮🇷 معرفی فارسی
هاست‌اسنایپر یه ابزار قدرتمند برای ریورس آی‌پی و شناسایی دامنه‌ها هست. کافیه یه آی‌پی یا آدرس دامنه بهش بدی، تا تمام دامنه‌هایی که روی همون سرور میزبانی میشن رو پیدا کنه و اطلاعات کاملی ازشون استخراج کنه.
✨ امکانات
🔍 پیدا کردن تمام دامنه‌های روی یک سرور (Reverse IP)
📡 پینگ گرفتن از تمام دامنه‌های پیدا شده
🔒 بررسی گواهینامه SSL هر دامنه
🕵️ استخراج اطلاعات WHOIS
🧬 دریافت رکوردهای DNS (مثل NS, A, MX)
📥 نصب و
git clone https://github.com/YOUR_USERNAME/HostSniper.gitcd HostSniperpython hostsniper.py --target example.com
🤝 مشارکت
اگه باگی پیدا کردی یا پیشنهادی داری، خوشحال میشم توی Issues بهم بگی یا Pull Request بزنی!
📜 License
This project is licensed under the MIT License - see the LICENSE file for details.
<div align="center">

Made with ❤️ by Mehrdad Gharibi
⭐ If you found this useful, please star the repo!
</div>
