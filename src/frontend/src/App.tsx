import { Heart, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { SiFacebook, SiInstagram, SiYoutube } from "react-icons/si";

const INSTAGRAM_URL =
  "https://www.instagram.com/shriramnavamiusari?igsh=MTBrMWRweHR6NnFsNw%3D%3D&utm_source=qr";
const FACEBOOK_URL =
  "https://www.facebook.com/share/171acEou4N/?mibextid=wwXIfr";
const YOUTUBE_URL = "https://www.youtube.com/@shriramnavamiusari";

const NAV_ITEMS = [
  { label: "होम", id: "home", ocid: "nav.link.1" },
  { label: "हमारे बारे में", id: "about", ocid: "nav.link.2" },
  { label: "कार्यक्रम", id: "events", ocid: "nav.link.3" },
  { label: "दान करें", id: "donation", ocid: "nav.link.4" },
];

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background font-body">
      {/* ── HEADER / NAV ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-sm shadow-md border-b border-saffron-200"
            : "bg-saffron-900/90 backdrop-blur-sm"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo + Title */}
          <div className="flex items-center gap-3">
            <img
              src="/assets/uploads/234724-3.png"
              alt="Logo"
              className="w-12 h-12 rounded-full object-cover border-2 border-saffron-400 shadow-saffron"
            />
            <div>
              <h1
                className={`hindi-text font-bold text-base leading-tight ${
                  scrolled ? "text-saffron-700" : "text-saffron-100"
                }`}
              >
                श्री राम नवमी सेवा समिति
              </h1>
              <p
                className={`text-xs ${
                  scrolled ? "text-saffron-500" : "text-saffron-300"
                }`}
              >
                उसरी (हसनपुरा) | स्थापना: २०१२
              </p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-5">
            {NAV_ITEMS.map((item) => (
              <button
                type="button"
                key={item.id}
                data-ocid={item.ocid}
                onClick={() => scrollTo(item.id)}
                className={`hindi-text font-medium transition-colors hover:text-saffron-400 text-sm ${
                  scrolled ? "text-saffron-700" : "text-saffron-200"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <X className={scrolled ? "text-saffron-700" : "text-white"} />
            ) : (
              <Menu className={scrolled ? "text-saffron-700" : "text-white"} />
            )}
          </button>
        </div>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-saffron-200 px-4 pb-4"
            >
              {NAV_ITEMS.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  data-ocid={item.ocid}
                  onClick={() => scrollTo(item.id)}
                  className="hindi-text block w-full text-left py-3 text-saffron-700 font-medium border-b border-saffron-100 last:border-0"
                >
                  {item.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main>
        {/* ── HERO SECTION ── */}
        <section
          id="home"
          className="relative min-h-screen flex items-center justify-center overflow-hidden"
        >
          <img
            src="/assets/uploads/234736-2.png"
            alt="Ram Navami Banner"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="hero-overlay absolute inset-0" />

          {/* Decorative gold border overlay */}
          <div className="absolute inset-4 border border-saffron-400/50 pointer-events-none" />
          <div className="absolute inset-8 border border-saffron-300/25 pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative z-10 text-center px-6 max-w-3xl"
          >
            {/* Om symbol */}
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: 0.3,
                duration: 0.8,
                type: "spring",
                bounce: 0.4,
              }}
              className="text-saffron-300 text-7xl mb-6 animate-float"
            >
              🕉️
            </motion.div>

            <motion.p
              initial={{ opacity: 0, letterSpacing: "0.3em" }}
              animate={{ opacity: 1, letterSpacing: "0.15em" }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="hindi-text text-saffron-300 text-sm md:text-base tracking-widest uppercase mb-3 font-semibold"
            >
              ।। श्री राम जय राम जय जय राम ।।
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.7 }}
              className="hindi-text text-white text-4xl md:text-6xl font-bold mb-4"
              style={{
                textShadow:
                  "0 2px 24px rgba(0,0,0,0.7), 0 0 60px rgba(255,153,0,0.25)",
              }}
            >
              जय श्री राम 🙏
            </motion.h2>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.75, duration: 0.6 }}
              className="h-0.5 w-48 mx-auto bg-gradient-to-r from-transparent via-saffron-400 to-transparent mb-5"
            />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="hindi-text text-saffron-100 text-xl md:text-3xl font-semibold mb-2"
              style={{ textShadow: "0 2px 12px rgba(0,0,0,0.6)" }}
            >
              श्री राम नवमी सेवा समिति
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.95 }}
              className="hindi-text text-saffron-300 text-base md:text-lg"
            >
              उसरी (हसनपुरा) | स्थापना: २०१२
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.15 }}
              className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
            >
              <button
                type="button"
                data-ocid="hero.primary_button"
                onClick={() => scrollTo("events")}
                className="btn-saffron hindi-text px-8 py-3.5 rounded-full font-bold text-lg shadow-saffron-lg"
              >
                🎉 कार्यक्रम देखें
              </button>
              <button
                type="button"
                data-ocid="hero.secondary_button"
                onClick={() => scrollTo("donation")}
                className="bg-white/15 backdrop-blur-sm hindi-text text-white border border-white/50 px-8 py-3.5 rounded-full font-bold text-lg hover:bg-white/25 transition-all"
              >
                दान करें 🙏
              </button>
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.8 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-saffron-300 text-3xl"
          >
            ▾
          </motion.div>
        </section>

        {/* ── ABOUT SECTION ── */}
        <section id="about" className="section-warm py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <p className="text-saffron-500 hindi-text text-sm tracking-widest uppercase mb-2">
                🪷 परिचय 🪷
              </p>
              <h2 className="hindi-text text-3xl md:text-4xl font-bold text-saffron-800 mb-6">
                हमारे बारे में
              </h2>
              <div className="divider-om mb-10">
                <span className="hindi-text text-saffron-500 text-sm">
                  ॥ श्री राम ॥
                </span>
              </div>
            </motion.div>

            {/* Logo centered */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="flex justify-center mb-10"
            >
              <div className="relative">
                <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-saffron-400 shadow-saffron-lg">
                  <img
                    src="/assets/uploads/234724-3.png"
                    alt="Shri Ram Navami Seva Samiti Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div
                  className="absolute -inset-3 rounded-full border-2 border-dashed border-saffron-300 animate-spin"
                  style={{ animationDuration: "20s" }}
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="festive-card rounded-2xl p-8 md:p-12 max-w-2xl mx-auto"
            >
              <p className="hindi-text text-saffron-800 text-lg md:text-xl leading-relaxed mb-6">
                श्री राम नवमी सेवा समिति, उसरी (हसनपुरा) — स्थापना{" "}
                <strong>2012</strong> से हर वर्ष राम नवमी महोत्सव का भव्य आयोजन करती
                है।
              </p>
              <p className="hindi-text text-saffron-700 text-base leading-relaxed mb-6">
                हर वर्ष राम नवमी के पावन अवसर पर भजन-कीर्तन, शोभायात्रा और धार्मिक
                कार्यक्रमों का आयोजन किया जाता है। समिति समाज की सेवा एवं धर्म के
                प्रचार-प्रसार के लिए समर्पित है।
              </p>
              <div className="lotus-divider">🪷 🪷 🪷</div>
              <p className="hindi-text text-saffron-600 text-base font-semibold italic">
                आपकी सेवा, हमारी भक्ति।
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── EVENTS SECTION ── */}
        <section id="events" className="section-deep py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="text-center mb-12"
            >
              <p className="text-saffron-400 hindi-text text-sm tracking-widest uppercase mb-2">
                🎉 आगामी कार्यक्रम 🎉
              </p>
              <h2 className="hindi-text text-3xl md:text-4xl font-bold text-saffron-300 mb-3">
                आगामी कार्यक्रम
              </h2>
              <div className="divider-om">
                <span className="text-saffron-500">✦ श्री राम जन्मोत्सव ✦</span>
              </div>
            </motion.div>

            {/* Event Card */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              data-ocid="events.card"
              className="max-w-2xl mx-auto"
            >
              {/* Banner Image with gold border */}
              <div
                className="rounded-2xl overflow-hidden mb-8"
                style={{
                  padding: "3px",
                  background:
                    "linear-gradient(135deg, #d4a017, #f5c518, #b8860b, #f5c518, #d4a017)",
                  boxShadow:
                    "0 0 40px rgba(212,160,23,0.35), 0 8px 32px rgba(0,0,0,0.5)",
                }}
              >
                <div className="rounded-xl overflow-hidden bg-saffron-950">
                  <img
                    src="/assets/uploads/IMG_20260314_021809_592-1.jpg"
                    alt="श्री राम जन्मोत्सव समारोह - श्री राम कथा बैनर"
                    className="w-full h-auto object-contain block"
                  />
                </div>
              </div>

              {/* Event Details Card */}
              <div
                className="bg-white/5 backdrop-blur-sm border border-saffron-600/40 rounded-2xl p-8"
                style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.4)" }}
              >
                <h3 className="hindi-text text-2xl md:text-3xl font-bold text-saffron-300 text-center mb-2">
                  श्री राम जन्मोत्सव समारोह
                </h3>
                <p className="hindi-text text-saffron-400 text-center text-base mb-6">
                  संगीतमय श्री राम कथा एवं रामचरितमानस नवाह परायण
                </p>

                <div className="space-y-4">
                  {/* Venue */}
                  <div className="flex items-start gap-3 bg-saffron-900/40 rounded-xl px-4 py-3">
                    <span className="text-xl mt-0.5">📍</span>
                    <div>
                      <p className="hindi-text text-saffron-400 text-xs font-semibold tracking-wider uppercase mb-0.5">
                        कथा स्थल
                      </p>
                      <p className="hindi-text text-saffron-200 font-medium">
                        शिव मन्दिर परिसर, उश्री, नगर पंचायत हसनपुरा
                      </p>
                    </div>
                  </div>

                  {/* Start */}
                  <div className="flex items-start gap-3 bg-saffron-900/40 rounded-xl px-4 py-3">
                    <span className="text-xl mt-0.5">🏺</span>
                    <div>
                      <p className="hindi-text text-saffron-400 text-xs font-semibold tracking-wider uppercase mb-0.5">
                        मंगल कलश यात्रा
                      </p>
                      <p className="hindi-text text-saffron-200 font-medium">
                        19 मार्च 2026, दिन-गुरूवार, सुबह 07 बजे से
                      </p>
                    </div>
                  </div>

                  {/* Katha Timing */}
                  <div className="flex items-start gap-3 bg-saffron-900/40 rounded-xl px-4 py-3">
                    <span className="text-xl mt-0.5">📿</span>
                    <div>
                      <p className="hindi-text text-saffron-400 text-xs font-semibold tracking-wider uppercase mb-0.5">
                        श्री राम कथा शुभारम्भ
                      </p>
                      <p className="hindi-text text-saffron-200 font-medium">
                        सायं 06 बजे से रात्रि 11 बजे तक प्रतिदिन
                      </p>
                    </div>
                  </div>

                  {/* Shobha Yatra */}
                  <div className="flex items-start gap-3 bg-saffron-900/40 rounded-xl px-4 py-3">
                    <span className="text-xl mt-0.5">🎺</span>
                    <div>
                      <p className="hindi-text text-saffron-400 text-xs font-semibold tracking-wider uppercase mb-0.5">
                        भव्य शोभा यात्रा
                      </p>
                      <p className="hindi-text text-saffron-200 font-medium">
                        27 मार्च 2026, दिन-शुक्रवार, दोपहर 12 बजे से
                      </p>
                    </div>
                  </div>

                  {/* Katha Vachak - highlighted */}
                  <div
                    className="rounded-xl px-5 py-4 text-center"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(212,160,23,0.15), rgba(255,153,0,0.1))",
                      border: "1px solid rgba(212,160,23,0.5)",
                    }}
                  >
                    <p className="hindi-text text-saffron-400 text-xs font-semibold tracking-wider uppercase mb-1">
                      कथा वाचक
                    </p>
                    <p className="hindi-text text-saffron-200 text-xl font-bold">
                      डॉ. लवी मैत्रेयी जी
                    </p>
                    <p className="hindi-text text-saffron-400 text-sm">
                      श्रीधाम वृन्दावन
                    </p>
                  </div>

                  {/* Organizers */}
                  <div className="flex items-start gap-3 bg-saffron-900/40 rounded-xl px-4 py-3">
                    <span className="text-xl mt-0.5">🙏</span>
                    <div>
                      <p className="hindi-text text-saffron-400 text-xs font-semibold tracking-wider uppercase mb-0.5">
                        आयोजक / संयोजक
                      </p>
                      <p className="hindi-text text-saffron-200 font-medium">
                        रामनवमी सेवा समिति
                      </p>
                      <p className="hindi-text text-saffron-400 text-sm">
                        संयोजक: आयुष्मान सेवा संघ
                      </p>
                    </div>
                  </div>
                </div>

                <div className="lotus-divider mt-6">🪷 🕉️ 🪷</div>
                <p className="hindi-text text-saffron-400 text-center text-sm mt-2">
                  सभी भक्तजन सादर आमंत्रित हैं
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── DONATION SECTION ── */}
        <section
          id="donation"
          className="section-warm py-20 px-4"
          data-ocid="donation.section"
        >
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <p className="text-saffron-500 hindi-text text-lg tracking-wider mb-2">
                🙏
              </p>
              <h2 className="hindi-text text-3xl md:text-4xl font-bold text-saffron-800 mb-2">
                दान करें - सहयोग करें
              </h2>
              <p className="hindi-text text-saffron-600 text-xl mb-8 italic">
                "अतिथि देवो भव:"
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="festive-card rounded-2xl p-8 md:p-12"
            >
              {/* Org name */}
              <div className="mb-6">
                <h3 className="hindi-text text-2xl md:text-3xl font-bold text-saffron-800 mb-1">
                  आयुष्मान सेवा संघ
                </h3>
                <p className="hindi-text text-saffron-600 text-base">
                  धर्मशाला निर्माण सह विवाह भवन
                </p>
              </div>

              <div className="divider-om mb-8">
                <span className="text-saffron-500">✦</span>
              </div>

              {/* Quote */}
              <div className="bg-saffron-100 border border-saffron-300 rounded-xl p-4 mb-8">
                <p className="hindi-text text-saffron-800 text-base md:text-lg leading-relaxed">
                  "धर्मशाला के रख-रखाव एवं विकास कार्य हेतु अपनी स्वेच्छा से दान दें।"
                </p>
              </div>

              <p className="hindi-text text-saffron-700 text-base mb-8">
                आपका छोटा सा सहयोग, प्रभु कार्य के लिए
              </p>

              {/* QR Code */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex justify-center mb-8"
              >
                <div className="qr-border rounded-xl overflow-hidden bg-white p-3 inline-block">
                  <img
                    src="/assets/uploads/IMG_20260314_020614_556-1.jpg"
                    alt="Payment QR Code - Ayushman Sewa Sangh"
                    className="w-64 h-64 md:w-80 md:h-80 object-contain"
                  />
                </div>
              </motion.div>

              {/* Verification */}
              <div className="bg-saffron-50 border border-saffron-300 rounded-xl p-4 mb-4">
                <p className="hindi-text text-saffron-700 text-sm mb-1">
                  पुष्टि हेतु नाम जाँचें:
                </p>
                <p className="text-saffron-800 font-bold text-lg tracking-wide">
                  Ayushman Sewa Sangh
                </p>
                <p className="text-saffron-600 text-sm mt-1">
                  Account Holder:{" "}
                  <span className="font-semibold text-saffron-700">
                    Ayushman Seva Sangh
                  </span>
                </p>
              </div>

              <p className="hindi-text text-saffron-800 text-2xl font-bold mt-6">
                धन्यवाद! 🙏
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── SOCIAL MEDIA SECTION ── */}
        <section id="social" className="section-deep py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="hindi-text text-3xl md:text-4xl font-bold text-saffron-300 mb-3">
                हमसे जुड़ें
              </h2>
              <p className="hindi-text text-saffron-400 mb-10">
                सोशल मीडिया पर हमें फॉलो करें
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Instagram */}
              <motion.a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                data-ocid="social.instagram.button"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.04, y: -4 }}
                className="group bg-white/5 border border-saffron-600/40 rounded-2xl p-8 flex flex-col items-center gap-4 cursor-pointer hover:bg-white/10 transition-all"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg"
                  style={{
                    background:
                      "linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
                  }}
                >
                  <SiInstagram size={30} />
                </div>
                <div>
                  <p className="font-bold text-saffron-300 text-lg">
                    Instagram
                  </p>
                  <p className="hindi-text text-saffron-500 text-sm">
                    @shriramnavamiusari
                  </p>
                </div>
              </motion.a>

              {/* Facebook */}
              <motion.a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                data-ocid="social.facebook.button"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.04, y: -4 }}
                className="group bg-white/5 border border-saffron-600/40 rounded-2xl p-8 flex flex-col items-center gap-4 cursor-pointer hover:bg-white/10 transition-all"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg"
                  style={{ background: "#1877F2" }}
                >
                  <SiFacebook size={30} />
                </div>
                <div>
                  <p className="font-bold text-saffron-300 text-lg">Facebook</p>
                  <p className="hindi-text text-saffron-500 text-sm">
                    श्री राम नवमी उसरी
                  </p>
                </div>
              </motion.a>

              {/* YouTube */}
              <motion.a
                href={YOUTUBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                data-ocid="social.youtube.button"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.04, y: -4 }}
                className="group bg-white/5 border border-saffron-600/40 rounded-2xl p-8 flex flex-col items-center gap-4 cursor-pointer hover:bg-white/10 transition-all"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg"
                  style={{ background: "#FF0000" }}
                >
                  <SiYoutube size={30} />
                </div>
                <div>
                  <p className="font-bold text-saffron-300 text-lg">YouTube</p>
                  <p className="hindi-text text-saffron-500 text-sm">
                    @shriramnavamiusari
                  </p>
                </div>
              </motion.a>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="section-deep py-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="lotus-divider mb-6">🪷 🕉️ 🪷</div>

          <img
            src="/assets/uploads/234724-3.png"
            alt="Logo"
            className="w-16 h-16 rounded-full mx-auto mb-4 border-2 border-saffron-500 object-cover"
          />

          <h3 className="hindi-text text-saffron-300 text-xl font-bold mb-1">
            श्री राम नवमी सेवा समिति
          </h3>
          <p className="hindi-text text-saffron-500 text-sm mb-4">
            उसरी (हसनपुरा) | स्थापना: २०१२
          </p>

          <p className="hindi-text text-saffron-400 text-2xl font-bold mb-6">
            जय श्री राम 🙏
          </p>

          {/* Social links row */}
          <div className="flex justify-center gap-4 mb-6">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110"
              style={{
                background:
                  "linear-gradient(135deg, #f09433, #dc2743, #bc1888)",
              }}
            >
              <SiInstagram size={18} />
            </a>
            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110"
              style={{ background: "#1877F2" }}
            >
              <SiFacebook size={18} />
            </a>
            <a
              href={YOUTUBE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110"
              style={{ background: "#FF0000" }}
            >
              <SiYoutube size={18} />
            </a>
          </div>

          <div className="border-t border-saffron-700/40 pt-5 space-y-2">
            <p className="text-saffron-600 text-xs">
              © {new Date().getFullYear()}. Built with{" "}
              <Heart className="inline w-3 h-3 text-saffron-500" /> using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-saffron-500 hover:text-saffron-400 underline"
              >
                caffeine.ai
              </a>
            </p>
            <p className="text-saffron-600/70 text-xs">
              Website Designed by:{" "}
              <span className="text-saffron-500 font-medium">
                Prakash Kumar
              </span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
