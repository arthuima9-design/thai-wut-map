# 🇹🇭 Thai Wut Map (แผนที่ติดตามภัยธรรมชาติประเทศไทย)

> **"เปิดเว็บเดียว รู้ทันทุกภัยธรรมชาติ ตำแหน่งฝนตก เส้นทางน้ำท่วม และตรวจเช็กความปลอดภัยรอบพิกัด GPS ของคุณแบบเรียลไทม์"**

🌐 **เข้าชมเว็บไซต์จริง (Production Live):**
- **Cloudflare Pages:** [https://thai-wut-map.pages.dev](https://thai-wut-map.pages.dev)
- **Cloudflare Workers:** [https://thai-wut-map.art-huima9.workers.dev](https://thai-wut-map.art-huima9.workers.dev)

---

## 🌟 จุดเด่นและฟีเจอร์หลัก (Key Features)

### 1. 📍 ระบบ GPS ตรวจจับพิกัดตนเอง & พื้นที่ของฉัน (Live Geolocation)
- **ปุ่ม GPS สไตล์ Google Maps**: กดค้นหาตำแหน่งปัจจุบันบนมือถือหรือคอมพิวเตอร์ได้ทันที
- **Pulsing Blue Location Marker**: แสดงจุดสีฟ้าพร้อมคลื่นกระพริบ และวงรัศมีความแม่นยำ (Accuracy Circle) ตามพิกัดจริงของอุปกรณ์
- **ปุ่มดึงพิกัดอัตโนมัติใน "พื้นที่ของฉัน" (My Area)**: กดครั้งเดียว ระบบจะคำนวณหาจังหวัดและอำเภอของคุณโดยอัตโนมัติ พร้อมตรวจจับภัยพิบัติรอบตัวในรัศมี 90 กม.

### 2. 🔍 พิมพ์ค้นหาที่อยู่ / สถานที่สำคัญแบบ Google Maps (Address Autocomplete)
- รองรับการพิมพ์ค้นหาทั้งสถานที่สำคัญ, ห้างสรรพสินค้า, โรงพยาบาล, ชายหาด, สถานีรถไฟฟ้า, ถนน, ซอย, อำเภอ, จังหวัด (เช่น *สยามพารากอน*, *รพ.ศิริราช*, *หาดป่าตอง*, *ถนนสุขุมวิท*)
- ปักหมุดสีแดง (Search Drop Pin) แสดงชื่อสถานที่และพิกัด พร้อมบิน (FlyTo) ไปซูมดูระดับสถานที่ทันที

### 3. 🌧️ เรดาร์ตรวจจับกลุ่มฝนและก้อนเมฆดาวเทียมแบบเรียลไทม์ (Doppler Radar & Satellite Clouds)
- เชื่อมต่อ RainViewer API แสดงภาพเรดาร์ตรวจน้ำฝนจริงครอบคลุมประเทศไทย
- แอนิเมชันภาพเคลื่อนไหวกลุ่มฝนย้อนหลัง 2 ชั่วโมง พร้อมแถบควบคุม Play/Pause/Scrubbing
- ภาพถ่ายดาวเทียมอินฟราเรด (Infrared Satellite) แสดงแนวการก่อตัวของกลุ่มเมฆฝน

### 4. 🌊 เส้นทางน้ำและเขื่อนกักเก็บน้ำหลักทั่วประเทศ (Rivers & Major Dams)
- แสดงเส้นทางแม่น้ำสายหลักของไทย (เจ้าพระยา, ป่าสัก, แม่กลอง, มูล, ชี, ปิง, วัง, ยม, น่าน, โขง) พร้อมทิศทางการไหลและสถานะตลิ่ง
- แสดงเขื่อนหลักทั้ง 12 แห่ง พร้อมเปอร์เซ็นต์ปริมาณน้ำกักเก็บ อัตราการระบายน้ำ และระดับความจุแบบเรียลไทม์

### 5. ☀️ โทนสว่าง (Clean Light UI Theme)
- ปรับโทนสีให้อ่านง่าย สบายตา สีตัวอักษรคมชัด ไม่แสบตา ทั้งในเวลากลางวันและกลางคืน

### 6. ⚠️ สรุปสถานการณ์ภัยพิบัติและการแจ้งเตือนฉุกเฉิน
- กรองแยกประเภทภัยได้ทันที: น้ำท่วม, ฝนตกหนัก, แผ่นดินไหว, ไฟป่า/จุดความร้อน, พายุ, ดินถล่ม
- รวบรวมเบอร์โทรสายด่วนฉุกเฉิน 24 ชั่วโมง (1784 ปภ., 1669 กู้ชีพ, 1182 อุตุนิยมวิทยา ฯลฯ)

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)
- **Frontend Framework:** React 19 + TypeScript + Vite 8
- **Map Engine:** Leaflet 1.9 + OpenStreetMap Tile Layer + Esri World Imagery Satellite
- **Styling & UI:** Tailwind CSS + Lucide Icons
- **Data & APIs:**
  - OpenStreetMap Nominatim API (Search & Reverse Geocoding)
  - RainViewer API (Weather Radar & Satellite Imagery)
  - TMD, DPM, EGAT, USGS, GISTDA Open Disaster Datasets
- **Hosting & Infrastructure:** Cloudflare Pages / Cloudflare Workers + GitHub Actions CI/CD

---

## 🚀 การติดตั้งและรันในเครื่อง (Local Development)

```bash
# 1. ติดตั้ง Dependencies
npm install

# 2. เริ่มต้นรัน Dev Server
npm run dev

# 3. ตรวจสอบการ Build
npm run build

# 4. ทดสอบ Deployment ไปยัง Cloudflare
npm run deploy
```

---

© 2026 **Thai Wut Map** - พัฒนาเพื่อความปลอดภัยและการเข้าถึงข้อมูลภัยพิบัติที่รวดเร็วของประชาชนไทย
