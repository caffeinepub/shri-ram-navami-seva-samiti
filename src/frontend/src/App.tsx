import {
  Download,
  Heart,
  IndianRupee,
  Loader2,
  Lock,
  Phone,
  Shield,
  User,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { SiFacebook, SiInstagram, SiYoutube } from "react-icons/si";
import { useActor } from "./hooks/useActor";

// Compress image to base64 within size limit for ICP
function compressImageToBase64(
  file: File,
  maxWidth = 800,
  quality = 0.7,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      let w = img.width;
      let h = img.height;
      if (w > maxWidth) {
        h = Math.round((h * maxWidth) / w);
        w = maxWidth;
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = reject;
    img.src = url;
  });
}

// Iteratively compress base64 string to stay under maxBytes
async function ensureSizeLimit(
  base64: string,
  maxBytes = 80_000,
): Promise<string> {
  if (base64.length <= maxBytes) return base64;
  // Draw onto canvas and recompress at lower quality
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let quality = 0.4;
      let w = img.width;
      let h = img.height;
      // Reduce dimensions aggressively
      const maxW = 150;
      if (w > maxW) {
        h = Math.round((h * maxW) / w);
        w = maxW;
      }
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);
      let result = canvas.toDataURL("image/jpeg", quality);
      // Further reduce quality until small enough
      while (result.length > maxBytes && quality > 0.05) {
        quality -= 0.05;
        result = canvas.toDataURL("image/jpeg", quality);
      }
      resolve(result);
    };
    img.onerror = () => resolve(""); // on error return empty
    img.src = base64;
  });
}

const INSTAGRAM_URL =
  "https://www.instagram.com/shriramnavamiusari?igsh=MTBrMWRweHR6NnFsNw%3D%3D&utm_source=qr";
const FACEBOOK_URL =
  "https://www.facebook.com/share/171acEou4N/?mibextid=wwXIfr";
const YOUTUBE_URL = "https://www.youtube.com/@shriramnavamiusari";

const NAV_ITEMS = [
  { label: "होम", id: "home", ocid: "nav.link.1" },
  { label: "हमारे बारे में", id: "about", ocid: "nav.link.2" },
  { label: "कार्यक्रम", id: "events", ocid: "nav.link.3" },
  { label: "🔴 लाइव", id: "live", ocid: "nav.link.live" },
  { label: "दान करें", id: "donation", ocid: "nav.link.4" },
  { label: "🪪 ID Card", id: "idcard", ocid: "nav.link.5" },
];

interface Donation {
  name: string;
  phone: string;
  amount: string;
  note: string;
  screenshot: string;
  timestamp: bigint;
}

interface MemberApplication {
  id: bigint;
  name: string;
  phone: string;
  address: string;
  occupation: string;
  photo: string;
  status: string;
  paymentDone: boolean;
  paymentScreenshot: string;
  timestamp: bigint;
}

function formatTimestamp(ts: bigint): string {
  try {
    const ms = Number(ts / 1_000_000n);
    return new Date(ms).toLocaleString("hi-IN");
  } catch {
    return "—";
  }
}

function IDCardPreview({ member }: { member: MemberApplication }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const downloadIDCard = async () => {
    const printWin = window.open("", "_blank", "width=900,height=600");
    if (!printWin) return;
    const photoHtml = member.photo
      ? `<img src="${member.photo}" style="width:100%;height:100%;object-fit:cover;border-radius:6px;" />`
      : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#b45309;font-size:11px;font-family:'Noto Sans Devanagari',sans-serif;">फोटो</div>`;
    printWin.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700;900&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Noto Sans Devanagari',sans-serif;background:#f5f5f5;display:flex;justify-content:center;align-items:center;min-height:100vh;padding:30px;}
@media print{body{background:white;padding:0;}@page{margin:0;}}
.card{width:420px;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.25);border:3px solid #b45309;}
.card-top{background:linear-gradient(135deg,#FF8C00,#FFD700,#FF8C00);padding:10px 14px 8px;text-align:center;border-bottom:2px solid #b45309;}
.jay{color:#7B0000;font-weight:900;font-size:15px;letter-spacing:1px;text-shadow:0 1px 0 rgba(255,255,255,0.5);}
.header-row{display:flex;align-items:center;gap:10px;margin-top:6px;}
.logo{width:48px;height:48px;object-fit:contain;border-radius:50%;border:2px solid #b45309;background:white;padding:2px;}
.org-info{flex:1;}
.org-name{color:#7B0000;font-weight:900;font-size:16px;line-height:1.3;text-shadow:0 1px 0 rgba(255,255,255,0.6);}
.org-sub{color:#5c3d00;font-size:11px;font-weight:600;margin-top:2px;}
.id-label{background:#7B0000;color:#FFD700;font-size:10px;font-weight:700;padding:2px 10px;border-radius:20px;margin-top:6px;display:inline-block;letter-spacing:1px;}
.card-body{background:linear-gradient(180deg,#FFF8E1 0%,#FFFDE7 60%,#FFF3CD 100%);padding:14px 16px;}
.content-row{display:flex;gap:14px;align-items:flex-start;}
.fields{flex:1;}
.field-block{margin-bottom:10px;}
.field-label{color:#7B0000;font-weight:700;font-size:13px;}
.field-line{border-bottom:1.5px dotted #b45309;margin:3px 0 2px;}
.field-value{color:#1a1a1a;font-size:13px;font-weight:600;padding-left:2px;}
.photo-col{display:flex;flex-direction:column;align-items:center;gap:6px;}
.photo-box{width:88px;height:100px;border:2px solid #b45309;border-radius:8px;overflow:hidden;background:#fff8e1;}
.member-badge{background:#7B0000;color:#FFD700;font-size:10px;font-weight:700;padding:2px 8px;border-radius:10px;text-align:center;}
.card-footer{background:linear-gradient(135deg,#FF8C00,#FFD700,#FF8C00);padding:8px 16px;display:flex;justify-content:space-between;align-items:center;border-top:2px solid #b45309;}
.footer-left{color:#7B0000;font-size:10px;font-weight:700;}
.footer-right{color:#7B0000;font-size:10px;font-weight:700;text-align:right;}
.sig-line{border-top:1.5px solid #7B0000;width:80px;margin-top:4px;}
</style></head><body>
<div class="card">
  <div class="card-top">
    <div class="jay">॥ जय श्री राम ॥</div>
    <div class="header-row">
      <img class="logo" src="${window.location.origin}/assets/uploads/234724-3.png" onerror="this.style.visibility='hidden'" />
      <div class="org-info">
        <div class="org-name">श्री राम नवामी सेवा समिति</div>
        <div class="org-sub">उसरी, हसनपुरा — रामनवामी सेवा समिति</div>
      </div>
      <img class="logo" src="${window.location.origin}/assets/uploads/234724-3.png" onerror="this.style.visibility='hidden'" />
    </div>
    <div><span class="id-label">सदस्यता पहचान पत्र</span></div>
  </div>
  <div class="card-body">
    <div class="content-row">
      <div class="fields">
        <div class="field-block">
          <div class="field-label">नाम</div>
          <div class="field-line"></div>
          <div class="field-value">${member.name}</div>
        </div>
        <div class="field-block">
          <div class="field-label">दायित्व</div>
          <div class="field-line"></div>
          <div class="field-value">${member.occupation || "—"}</div>
        </div>
        <div class="field-block">
          <div class="field-label">पता</div>
          <div class="field-line"></div>
          <div class="field-value">${member.address || "—"}</div>
        </div>
        <div class="field-block">
          <div class="field-label">मो.</div>
          <div class="field-line"></div>
          <div class="field-value">${member.phone}</div>
        </div>
      </div>
      <div class="photo-col">
        <div class="photo-box">${photoHtml}</div>
      </div>
    </div>
  </div>
  <div class="card-footer">
    <div class="footer-left">जारी दिनांक: ${new Date().toLocaleDateString("hi-IN")}</div>
    <div class="footer-right">
      <div class="sig-line"></div>
      पदाधिकारी हस्ताक्षर
    </div>
  </div>
</div>
<script>window.onload=function(){setTimeout(function(){window.print();},800);}</script>
</body></html>`);
    printWin.document.close();
  };

  return (
    <div>
      {/* ID Card Visual - Saffron/Golden Professional Design */}
      <div
        ref={cardRef}
        className="mx-auto rounded-2xl overflow-hidden"
        style={{
          maxWidth: 380,
          border: "3px solid #b45309",
          boxShadow: "0 6px 24px rgba(0,0,0,0.18)",
          fontFamily: "'Noto Sans Devanagari', sans-serif",
        }}
      >
        {/* Top golden header */}
        <div
          className="px-3 pt-3 pb-2 text-center"
          style={{
            background: "linear-gradient(135deg,#FF8C00,#FFD700,#FF8C00)",
            borderBottom: "2px solid #b45309",
          }}
        >
          <p
            className="font-black text-sm tracking-wide"
            style={{ color: "#7B0000" }}
          >
            ॥ जय श्री राम ॥
          </p>
          <div className="flex items-center gap-2 mt-1">
            <img
              src="/assets/uploads/234724-3.png"
              alt=""
              className="w-10 h-10 rounded-full object-contain border-2 border-amber-800 bg-white p-0.5"
            />
            <div className="flex-1">
              <p
                className="font-black text-sm leading-tight"
                style={{ color: "#7B0000" }}
              >
                श्री राम नवामी सेवा समिति
              </p>
              <p className="text-xs font-semibold" style={{ color: "#5c3d00" }}>
                उसरी, हसनपुरा
              </p>
            </div>
            <img
              src="/assets/uploads/234724-3.png"
              alt=""
              className="w-10 h-10 rounded-full object-contain border-2 border-amber-800 bg-white p-0.5"
            />
          </div>
          <span
            className="inline-block mt-1 text-xs font-bold px-3 py-0.5 rounded-full"
            style={{
              background: "#7B0000",
              color: "#FFD700",
              letterSpacing: "1px",
            }}
          >
            सदस्यता पहचान पत्र
          </span>
        </div>

        {/* Card body - cream/golden */}
        <div
          style={{
            background:
              "linear-gradient(180deg,#FFF8E1 0%,#FFFDE7 60%,#FFF3CD 100%)",
            padding: "12px 14px",
          }}
        >
          <div className="flex gap-3 items-start">
            {/* Fields */}
            <div className="flex-1 space-y-2">
              {[
                { label: "नाम", value: member.name },
                { label: "दायित्व", value: member.occupation || "—" },
                { label: "पता", value: member.address || "—" },
                { label: "मो.", value: member.phone },
              ].map((f) => (
                <div key={f.label}>
                  <p className="text-xs font-bold" style={{ color: "#7B0000" }}>
                    {f.label}
                  </p>
                  <div
                    style={{
                      borderBottom: "1.5px dotted #b45309",
                      margin: "2px 0",
                    }}
                  />
                  <p
                    className="text-xs font-semibold"
                    style={{ color: "#1a1a1a" }}
                  >
                    {f.value}
                  </p>
                </div>
              ))}
            </div>
            {/* Photo */}
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div
                className="flex items-center justify-center overflow-hidden rounded-lg"
                style={{
                  width: 80,
                  height: 92,
                  border: "2px solid #b45309",
                  background: "#fff8e1",
                }}
              >
                {member.photo ? (
                  <img
                    src={member.photo}
                    alt="फोटो"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span
                    className="text-xs text-center"
                    style={{ color: "#b45309" }}
                  >
                    फोटो
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex justify-between items-center px-3 py-2"
          style={{
            background: "linear-gradient(135deg,#FF8C00,#FFD700,#FF8C00)",
            borderTop: "2px solid #b45309",
          }}
        >
          <p className="text-xs font-bold" style={{ color: "#7B0000" }}>
            दिनांक: {new Date().toLocaleDateString("hi-IN")}
          </p>
          <div className="text-right">
            <div
              style={{
                borderTop: "1.5px solid #7B0000",
                width: 72,
                marginBottom: 2,
              }}
            />
            <p className="text-xs font-bold" style={{ color: "#7B0000" }}>
              पदाधिकारी हस्ताक्षर
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={downloadIDCard}
        data-ocid="admin.member.id_card.button"
        className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-xl font-bold text-sm"
        style={{
          background: "linear-gradient(135deg,#FF8C00,#FFD700)",
          color: "#7B0000",
          border: "2px solid #b45309",
        }}
      >
        <Download className="w-4 h-4" />
        ID Card डाउनलोड करें (Image)
      </button>
    </div>
  );
}

export default function App() {
  const { actor } = useActor();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Donation form state
  const [donorName, setDonorName] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [donorAmount, setDonorAmount] = useState("");
  const [donorNote, setDonorNote] = useState("");
  const [_screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    name: string;
    phone: string;
    amount: string;
    note: string;
  } | null>(null);

  // Admin panel state
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminUserId, setAdminUserId] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminLoginError, setAdminLoginError] = useState("");
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loadingDonations, setLoadingDonations] = useState(false);
  const [clearingHistory, setClearingHistory] = useState(false);
  const [adminTab, setAdminTab] = useState<"donations" | "members">(
    "donations",
  );
  const [memberApplications, setMemberApplications] = useState<
    MemberApplication[]
  >([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [expandedMemberCard, setExpandedMemberCard] = useState<number | null>(
    null,
  );

  // Membership form state
  const [memberFormOpen, setMemberFormOpen] = useState(false);
  const [memberName, setMemberName] = useState("");
  const [memberPhone, setMemberPhone] = useState("");
  const [memberAddress, setMemberAddress] = useState("");
  const [memberOccupation, setMemberOccupation] = useState("");
  const [_memberPhotoFile, setMemberPhotoFile] = useState<File | null>(null);
  const [memberPhotoPreview, setMemberPhotoPreview] = useState<string | null>(
    null,
  );
  const [memberSubmitting, setMemberSubmitting] = useState(false);
  const [memberSubmitError, setMemberSubmitError] = useState("");
  const [memberSubmitted, setMemberSubmitted] = useState(false);

  // Member ID card lookup state
  const [memberLookupName, setMemberLookupName] = useState("");
  const [memberLookupPhone, setMemberLookupPhone] = useState("");
  const [memberLookupResult, setMemberLookupResult] = useState<
    MemberApplication | null | "not_found"
  >(null);
  const [memberLookupLoading, setMemberLookupLoading] = useState(false);
  const [paymentScreenshotFile, setPaymentScreenshotFile] =
    useState<string>("");
  const [paymentProofSubmitting, setPaymentProofSubmitting] = useState(false);
  const [paymentProofSubmitted, setPaymentProofSubmitted] = useState(false);
  const [paymentProofError, setPaymentProofError] = useState("");
  const [showMemberIDCard, setShowMemberIDCard] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const handleDonationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName.trim() || !donorPhone.trim() || !donorAmount.trim()) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      if (!actor) throw new Error("Not ready");
      const screenshotData = screenshotPreview
        ? await ensureSizeLimit(screenshotPreview, 300_000)
        : "";
      await actor.submitDonation(
        donorName,
        donorPhone,
        donorAmount,
        donorNote,
        screenshotData,
      );
      setSubmittedData({
        name: donorName,
        phone: donorPhone,
        amount: donorAmount,
        note: donorNote,
      });
      setSubmitted(true);
      setDonorName("");
      setDonorPhone("");
      setDonorAmount("");
      setDonorNote("");
      setScreenshotFile(null);
      setScreenshotPreview(null);
    } catch {
      setSubmitError("सबमिट करने में त्रुटि हुई। कृपया पुनः प्रयास करें।");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMemberFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName.trim() || !memberPhone.trim()) return;
    setMemberSubmitting(true);
    setMemberSubmitError("");
    try {
      if (!actor) {
        setMemberSubmitError("कनेक्शन तैयार नहीं है। कृपया 5 सेकंड बाद पुनः प्रयास करें।");
        return;
      }
      // Try to compress photo very aggressively
      let photoData = "";
      if (memberPhotoPreview) {
        try {
          photoData = await ensureSizeLimit(memberPhotoPreview, 80_000);
        } catch {
          photoData = ""; // if photo fails, submit without it
        }
      }
      try {
        await actor.submitMemberApplication(
          memberName,
          memberPhone,
          memberAddress,
          memberOccupation,
          photoData,
        );
      } catch {
        // Retry once without photo if failed
        await actor.submitMemberApplication(
          memberName,
          memberPhone,
          memberAddress,
          memberOccupation,
          "",
        );
      }
      setMemberSubmitted(true);
      setMemberName("");
      setMemberPhone("");
      setMemberAddress("");
      setMemberOccupation("");
      setMemberPhotoFile(null);
      setMemberPhotoPreview(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setMemberSubmitError(`सबमिट में त्रुटि: ${msg.substring(0, 400)}`);
    } finally {
      setMemberSubmitting(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUserId === "ram841236" && adminPassword === "Ram@8102") {
      setAdminAuthenticated(true);
      setAdminLoginError("");
      // Load donations
      setLoadingDonations(true);
      try {
        if (!actor) throw new Error("Not ready");
        const data = await actor.getAllDonations();
        setDonations(data as Donation[]);
      } catch {
        /* ignore */
      } finally {
        setLoadingDonations(false);
      }
      // Load members
      setLoadingMembers(true);
      try {
        if (!actor) throw new Error("Not ready");
        const mdata = await actor.getAllMemberApplications();
        setMemberApplications(mdata as MemberApplication[]);
      } catch {
        /* ignore */
      } finally {
        setLoadingMembers(false);
      }
    } else {
      setAdminLoginError("गलत User ID या Password। पुनः प्रयास करें।");
    }
  };

  const handleAdminClose = () => {
    setAdminOpen(false);
    setAdminUserId("");
    setAdminPassword("");
    setAdminLoginError("");
    setAdminAuthenticated(false);
    setDonations([]);
    setMemberApplications([]);
    setAdminTab("donations");
    setExpandedMemberCard(null);
  };

  const handleApproveMember = async (id: bigint) => {
    try {
      if (!actor) return;
      await actor.approveMemberApplication(id);
      setMemberApplications((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: "approved" } : m)),
      );
    } catch {
      /* ignore */
    }
  };

  const handleDeleteMember = async (id: bigint) => {
    try {
      if (!actor) return;
      await actor.deleteMemberApplication(id);
      setMemberApplications((prev) => prev.filter((m) => m.id !== id));
      setExpandedMemberCard(null);
    } catch {
      /* ignore */
    }
  };

  const handleDeleteDonation = async (idx: number) => {
    // We don't have per-record delete for donations in this version; only clear all
    // So we'll just remove from local state as a UX improvement
    setDonations((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleMemberLookup = async () => {
    if (!memberLookupName.trim() || !memberLookupPhone.trim()) return;
    setMemberLookupLoading(true);
    setMemberLookupResult(null);
    setShowMemberIDCard(false);
    setPaymentProofSubmitted(false);
    setPaymentScreenshotFile("");
    try {
      if (!actor) throw new Error("Not ready");
      const result = await (actor as any).getMemberByPhoneAndName(
        memberLookupPhone.trim(),
        memberLookupName.trim(),
      );
      if (result === null || result === undefined) {
        setMemberLookupResult("not_found");
      } else {
        setMemberLookupResult(result as MemberApplication);
        const r = result as MemberApplication;
        if (r.paymentDone && r.status === "approved") {
          setShowMemberIDCard(true);
        }
      }
    } catch (_e) {
      setMemberLookupResult("not_found");
    } finally {
      setMemberLookupLoading(false);
    }
  };

  const handleSubmitPaymentProof = async () => {
    if (
      !memberLookupResult ||
      memberLookupResult === "not_found" ||
      !paymentScreenshotFile
    )
      return;
    setPaymentProofSubmitting(true);
    try {
      if (!actor) throw new Error("Not ready");
      const compressed = await ensureSizeLimit(paymentScreenshotFile, 300_000);
      await actor.submitPaymentProof(memberLookupResult.id, compressed);
      setPaymentProofSubmitted(true);
    } catch (e) {
      console.error(e);
      setPaymentProofError(
        `Submit nahi hua. Dobara try karein ya photo chhoti karein. Error: ${String(e).slice(0, 200)}`,
      );
    } finally {
      setPaymentProofSubmitting(false);
    }
  };

  const handleRefreshMembers = async () => {
    setLoadingMembers(true);
    try {
      if (!actor) throw new Error("Not ready");
      const mdata = await actor.getAllMemberApplications();
      setMemberApplications(mdata as MemberApplication[]);
    } catch {
      /* ignore */
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleAdminConfirmPayment = async (id: bigint) => {
    try {
      if (!actor) throw new Error("Not ready");
      await actor.confirmMemberPayment(id);
      setMemberApplications((prev) =>
        prev.map((m) => (m.id === id ? { ...m, paymentDone: true } : m)),
      );
    } catch (e) {
      console.error(e);
    }
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
                className={`text-xs ${scrolled ? "text-saffron-500" : "text-saffron-300"}`}
              >
                उसरी (हसनपुरा) | स्थापना: २०१२
              </p>
            </div>
          </div>

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

          <button
            type="button"
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <X className={scrolled ? "text-saffron-700" : "text-white"} />
            ) : (
              <svg
                role="img"
                aria-labelledby="menu-icon-title"
                className={`w-6 h-6 ${scrolled ? "text-saffron-700" : "text-white"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <title id="menu-icon-title">Menu</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

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
          <div className="absolute inset-4 border border-saffron-400/50 pointer-events-none" />
          <div className="absolute inset-8 border border-saffron-300/25 pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative z-10 text-center px-6 max-w-3xl"
          >
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

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="flex justify-center mb-4"
            >
              <span
                className="hindi-text text-sm font-bold px-5 py-2 rounded-full"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(212,160,23,0.85), rgba(255,153,0,0.75))",
                  color: "#1a0a00",
                  boxShadow: "0 2px 16px rgba(212,160,23,0.4)",
                  letterSpacing: "0.05em",
                }}
              >
                🔴 19–27 मार्च 2026 • उसरी
              </span>
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
              className="mt-10 flex flex-col items-center gap-4"
            >
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  type="button"
                  data-ocid="hero.primary_button"
                  onClick={() => scrollTo("events")}
                  className="btn-saffron hindi-text px-8 py-3.5 rounded-full font-bold text-lg shadow-saffron-lg"
                >
                  🔴 अभी चल रहा है
                </button>
                <button
                  type="button"
                  data-ocid="hero.secondary_button"
                  onClick={() => scrollTo("donation")}
                  className="bg-white/15 backdrop-blur-sm hindi-text text-white border border-white/50 px-8 py-3.5 rounded-full font-bold text-lg hover:bg-white/25 transition-all"
                >
                  दान करें 🙏
                </button>
              </div>
              {/* Membership Button */}
              <button
                type="button"
                data-ocid="hero.member_button"
                onClick={() => {
                  setMemberFormOpen(true);
                  setMemberSubmitted(false);
                }}
                className="flex items-center gap-2 hindi-text text-white border border-white/40 bg-white/10 backdrop-blur-sm px-8 py-3 rounded-full font-bold text-base hover:bg-white/20 transition-all"
                style={{
                  borderColor: "rgba(255,230,100,0.5)",
                  color: "#FFE664",
                }}
              >
                <Users className="w-5 h-5" />
                सदस्य बनें
              </button>
            </motion.div>
          </motion.div>

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

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-6 max-w-2xl mx-auto"
            >
              <div
                className="rounded-2xl px-8 py-5 text-center"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(212,160,23,0.18), rgba(255,153,0,0.1))",
                  border: "2px solid rgba(212,160,23,0.4)",
                  boxShadow: "0 4px 20px rgba(212,160,23,0.15)",
                }}
              >
                <p className="hindi-text text-4xl font-bold text-saffron-700 mb-1">
                  14वाँ
                </p>
                <p className="hindi-text text-saffron-600 text-lg font-semibold">
                  भव्य आयोजन — वर्ष 2026
                </p>
                <p className="hindi-text text-saffron-500 text-sm mt-1">
                  स्थापना 2012 से निरंतर
                </p>
              </div>
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
                🔴 अभी चल रहा है • 19 से 27 मार्च 2026
              </p>
              <h2 className="hindi-text text-3xl md:text-4xl font-bold text-saffron-300 mb-3">
                श्री राम जन्मोत्सव समारोह
              </h2>
              <div className="flex items-center justify-center gap-3 mb-3">
                <span
                  className="flex items-center gap-1.5 bg-red-600/90 text-white text-xs font-bold px-3 py-1 rounded-full hindi-text tracking-wide shadow-lg"
                  style={{ animation: "pulse 2s infinite" }}
                >
                  <span
                    className="w-2 h-2 bg-white rounded-full inline-block"
                    style={{ animation: "ping 1s infinite" }}
                  />
                  लाइव
                </span>
              </div>
              <div className="divider-om">
                <span className="text-saffron-500">✦ श्री राम जन्मोत्सव ✦</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              data-ocid="events.card"
              className="max-w-2xl mx-auto"
            >
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

              <div
                className="bg-white/5 backdrop-blur-sm border border-saffron-600/40 rounded-2xl p-8"
                style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.4)" }}
              >
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="hindi-text text-xs font-semibold bg-saffron-900/60 text-saffron-300 border border-saffron-600/40 rounded-full px-4 py-1.5">
                    📅 19 मार्च से 27 मार्च 2026
                  </span>
                </div>
                <h3 className="hindi-text text-2xl md:text-3xl font-bold text-saffron-300 text-center mb-2">
                  श्री राम जन्मोत्सव समारोह
                </h3>
                <p className="hindi-text text-saffron-400 text-center text-base mb-6">
                  संगीतमय श्री राम कथा एवं रामचरितमानस नवाह परायण
                </p>

                <div className="space-y-4">
                  {[
                    {
                      icon: "📍",
                      label: "कथा स्थल",
                      text: "शिव मन्दिर परिसर, उश्री, नगर पंचायत हसनपुरा",
                    },
                    {
                      icon: "🏺",
                      label: "मंगल कलश यात्रा",
                      text: "19 मार्च 2026, दिन-गुरूवार, सुबह 07 बजे से",
                    },
                    {
                      icon: "📿",
                      label: "श्री राम कथा शुभारम्भ",
                      text: "सायं 06 बजे से रात्रि 11 बजे तक प्रतिदिन",
                    },
                    {
                      icon: "🎺",
                      label: "भव्य शोभा यात्रा",
                      text: "27 मार्च 2026, दिन-शुक्रवार, दोपहर 12 बजे से",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-start gap-3 bg-saffron-900/40 rounded-xl px-4 py-3"
                    >
                      <span className="text-xl mt-0.5">{item.icon}</span>
                      <div>
                        <p className="hindi-text text-saffron-400 text-xs font-semibold tracking-wider uppercase mb-0.5">
                          {item.label}
                        </p>
                        <p className="hindi-text text-saffron-200 font-medium">
                          {item.text}
                        </p>
                      </div>
                    </div>
                  ))}
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

            {/* Katha Vachak Card */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="max-w-2xl mx-auto mt-8"
            >
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  padding: "3px",
                  background:
                    "linear-gradient(135deg, #d4a017, #f5c518, #b8860b, #f5c518, #d4a017)",
                  boxShadow:
                    "0 0 40px rgba(212,160,23,0.35), 0 8px 32px rgba(0,0,0,0.5)",
                }}
              >
                <div
                  className="rounded-xl p-8 text-center"
                  style={{
                    background:
                      "linear-gradient(160deg, #1a0a00 0%, #2d1200 40%, #1a0800 100%)",
                  }}
                >
                  <p className="hindi-text text-saffron-400 text-xs font-bold tracking-[0.2em] uppercase mb-4">
                    ✦ विशेष आमंत्रित ✦
                  </p>
                  <div className="flex justify-center mb-5">
                    <div className="relative">
                      <div
                        className="w-32 h-32 rounded-full overflow-hidden"
                        style={{
                          border: "4px solid #f5c518",
                          boxShadow:
                            "0 0 0 3px rgba(245,197,24,0.3), 0 0 30px rgba(212,160,23,0.5)",
                        }}
                      >
                        <img
                          src="/assets/uploads/335601405_1922359371435088_7773286694791031155_n-1.jpg"
                          alt="कथा वाचक"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div
                        className="absolute -inset-2 rounded-full border-2 border-dashed border-saffron-500/60"
                        style={{
                          animationDuration: "12s",
                          animation: "spin 12s linear infinite",
                        }}
                      />
                    </div>
                  </div>
                  <h3 className="hindi-text text-2xl font-bold text-saffron-200 mb-1">
                    डॉ. लवी मैत्रेयी जी
                  </h3>
                  <p className="hindi-text text-saffron-400 text-sm font-semibold mb-1">
                    श्रीधाम वृन्दावन
                  </p>
                  <p className="hindi-text text-saffron-300 text-xs tracking-widest uppercase mb-4 font-bold">
                    कथा वाचक
                  </p>
                  <div
                    className="rounded-xl px-5 py-4"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(212,160,23,0.12), rgba(255,153,0,0.08))",
                      border: "1px solid rgba(212,160,23,0.3)",
                    }}
                  >
                    <p className="hindi-text text-saffron-300 text-sm leading-relaxed">
                      संगीतमय श्री राम कथा का मधुर वर्णन एवं भक्तों को राम भक्ति से
                      ओतप्रोत करने वाली प्रेरणादायी कथा
                    </p>
                  </div>
                  <div className="lotus-divider mt-5 mb-0">🪷 🕉️ 🪷</div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── YOUTUBE LIVE SECTION ── */}
        <section
          id="live"
          className="section-deep py-20 px-4"
          data-ocid="live.section"
        >
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="text-center mb-8"
            >
              {/* Live badge */}
              <div className="flex justify-center mb-4">
                <span
                  className="hindi-text text-sm font-bold px-5 py-2 rounded-full flex items-center gap-2"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(220,38,38,0.85), rgba(185,28,28,0.9))",
                    color: "#fff",
                    boxShadow: "0 2px 16px rgba(220,38,38,0.5)",
                  }}
                >
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-200" />
                  </span>
                  🔴 लाइव प्रसारण
                </span>
              </div>

              <h2
                className="hindi-text text-3xl md:text-4xl font-bold mb-3"
                style={{
                  background: "linear-gradient(135deg, #FFD700, #FF9800)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  textShadow: "none",
                }}
              >
                श्री राम कथा - लाइव प्रसारण
              </h2>
              <div className="h-0.5 w-32 mx-auto bg-gradient-to-r from-transparent via-saffron-400 to-transparent mb-4" />
              <p className="hindi-text text-saffron-300 text-sm">
                जब कथा प्रसारित हो रही हो, तो यहाँ लाइव देख सकते हैं
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* YouTube iframe with golden border */}
              <div
                className="relative w-full rounded-2xl overflow-hidden"
                style={{
                  paddingBottom: "56.25%",
                  border: "2px solid rgba(212,160,23,0.6)",
                  boxShadow:
                    "0 0 40px rgba(212,160,23,0.3), 0 8px 40px rgba(0,0,0,0.5)",
                }}
              >
                <iframe
                  src="https://www.youtube.com/embed/live_stream?channel=UCkKWPUDxD8siSXiTNrTOH9w&autoplay=0"
                  title="श्री राम कथा लाइव"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                  style={{ border: 0 }}
                />
              </div>

              {/* Info card below iframe */}
              <div
                className="mt-5 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4"
                style={{
                  background: "rgba(255,153,0,0.08)",
                  border: "1px solid rgba(212,160,23,0.3)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <div className="flex flex-col gap-1.5 text-center sm:text-left">
                  <span className="hindi-text text-saffron-200 text-sm">
                    📅 19 से 27 मार्च 2026
                  </span>
                  <span className="hindi-text text-saffron-200 text-sm">
                    ⏰ प्रतिदिन सायं 06 बजे से रात्रि 11 बजे तक
                  </span>
                </div>
                <a
                  href="https://www.youtube.com/@shriramnavamiusari"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-ocid="live.button"
                  className="btn-saffron hindi-text px-6 py-2.5 rounded-full font-bold text-sm whitespace-nowrap"
                >
                  YouTube पर देखें →
                </a>
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
              <div className="bg-saffron-100 border border-saffron-300 rounded-xl p-4 mb-8">
                <p className="hindi-text text-saffron-800 text-base md:text-lg leading-relaxed">
                  "धर्मशाला के रख-रखाव एवं विकास कार्य हेतु अपनी स्वेच्छा से दान दें।"
                </p>
              </div>
              <p className="hindi-text text-saffron-700 text-base mb-8">
                आपका छोटा सा सहयोग, प्रभु कार्य के लिए
              </p>

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
                    alt="Payment QR Code"
                    className="w-64 h-64 md:w-80 md:h-80 object-contain"
                  />
                </div>
              </motion.div>

              <div className="bg-saffron-50 border border-saffron-300 rounded-xl p-4 mb-8">
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

              {/* Donation Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div
                  className="rounded-2xl overflow-hidden text-left"
                  style={{
                    background: "linear-gradient(135deg, #fff8e8, #fff3d0)",
                    border: "2px solid #E8A020",
                    boxShadow: "0 10px 40px oklch(0.62 0.18 50 / 0.2)",
                  }}
                >
                  {/* Donation Form Header */}
                  <div
                    className="flex items-center gap-3 px-6 py-4"
                    style={{
                      background: "linear-gradient(135deg, #E8520A, #C93D00)",
                    }}
                  >
                    <IndianRupee className="w-6 h-6 text-white flex-shrink-0" />
                    <div>
                      <h3 className="hindi-text text-white font-bold text-xl">
                        दान विवरण भरें
                      </h3>
                      <p className="hindi-text text-orange-100 text-xs">
                        भुगतान के बाद नीचे विवरण भरकर सबमिट करें
                      </p>
                    </div>
                  </div>
                  <div className="p-6 md:p-8">
                    <AnimatePresence mode="wait">
                      {submitted && submittedData ? (
                        <motion.div
                          key="success"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.4 }}
                          data-ocid="donation.success_state"
                          className="rounded-xl p-6 text-center"
                          style={{
                            background:
                              "linear-gradient(135deg, oklch(0.92 0.08 130 / 0.3), oklch(0.95 0.05 140 / 0.3))",
                            border: "2px solid oklch(0.62 0.18 140)",
                          }}
                        >
                          <div className="text-5xl mb-3">🙏</div>
                          <h4 className="hindi-text text-xl font-bold text-green-700 mb-2">
                            धन्यवाद! आपका दान विवरण सफलतापूर्वक सबमिट हो गया 🙏
                          </h4>
                          <p className="hindi-text text-saffron-700 text-sm mb-5">
                            प्रभु राम आपका कल्याण करें।
                          </p>
                          <div
                            className="rounded-xl p-4 text-left space-y-2 mb-5"
                            style={{
                              background: "oklch(0.97 0.02 85)",
                              border: "1px solid oklch(0.82 0.10 60)",
                            }}
                          >
                            <p className="hindi-text text-saffron-700 text-sm">
                              <span className="font-semibold">नाम:</span>{" "}
                              {submittedData.name}
                            </p>
                            <p className="hindi-text text-saffron-700 text-sm">
                              <span className="font-semibold">मोबाइल:</span>{" "}
                              {submittedData.phone}
                            </p>
                            <p className="hindi-text text-saffron-700 text-sm">
                              <span className="font-semibold">दान राशि:</span> ₹
                              {submittedData.amount}
                            </p>
                            {submittedData.note && (
                              <p className="hindi-text text-saffron-700 text-sm">
                                <span className="font-semibold">संदेश:</span>{" "}
                                {submittedData.note}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => setSubmitted(false)}
                            className="btn-saffron hindi-text px-6 py-2 rounded-full text-sm font-medium"
                          >
                            और दान विवरण भरें
                          </button>
                        </motion.div>
                      ) : (
                        <motion.form
                          key="form"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onSubmit={handleDonationSubmit}
                          className="space-y-5"
                        >
                          <div>
                            <label
                              htmlFor="donor-name"
                              className="hindi-text text-saffron-800 font-semibold text-sm block mb-1.5"
                            >
                              नाम <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-saffron-400 pointer-events-none" />
                              <input
                                id="donor-name"
                                type="text"
                                required
                                value={donorName}
                                onChange={(e) => setDonorName(e.target.value)}
                                placeholder="अपना नाम लिखें"
                                data-ocid="donation.input"
                                className="hindi-text w-full pl-10 pr-4 py-3 rounded-xl border-2 border-saffron-300 bg-white text-saffron-900 placeholder:text-saffron-400 focus:border-orange-400 focus:outline-none transition-all text-base"
                              />
                            </div>
                          </div>
                          <div>
                            <label
                              htmlFor="donor-phone"
                              className="hindi-text text-saffron-800 font-semibold text-sm block mb-1.5"
                            >
                              मोबाइल नंबर <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-saffron-400 pointer-events-none" />
                              <input
                                id="donor-phone"
                                type="tel"
                                required
                                value={donorPhone}
                                onChange={(e) => setDonorPhone(e.target.value)}
                                placeholder="10 अंकों का मोबाइल नंबर"
                                data-ocid="donation.input"
                                className="hindi-text w-full pl-10 pr-4 py-3 rounded-xl border-2 border-saffron-300 bg-white text-saffron-900 placeholder:text-saffron-400 focus:border-orange-400 focus:outline-none transition-all text-base"
                              />
                            </div>
                          </div>
                          <div>
                            <label
                              htmlFor="donor-amount"
                              className="hindi-text text-saffron-800 font-semibold text-sm block mb-1.5"
                            >
                              दान राशि (₹){" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-saffron-400 pointer-events-none" />
                              <input
                                id="donor-amount"
                                type="text"
                                required
                                value={donorAmount}
                                onChange={(e) => setDonorAmount(e.target.value)}
                                placeholder="जितना दान दिया, वह राशि"
                                data-ocid="donation.input"
                                className="hindi-text w-full pl-10 pr-4 py-3 rounded-xl border-2 border-saffron-300 bg-white text-saffron-900 placeholder:text-saffron-400 focus:border-orange-400 focus:outline-none transition-all text-base"
                              />
                            </div>
                          </div>
                          <div>
                            <label
                              htmlFor="donor-note"
                              className="hindi-text text-saffron-800 font-semibold text-sm block mb-1.5"
                            >
                              संदेश{" "}
                              <span className="text-saffron-400 font-normal text-xs">
                                (वैकल्पिक)
                              </span>
                            </label>
                            <textarea
                              rows={3}
                              value={donorNote}
                              onChange={(e) => setDonorNote(e.target.value)}
                              placeholder="कोई संदेश..."
                              id="donor-note"
                              data-ocid="donation.textarea"
                              className="hindi-text w-full px-4 py-3 rounded-xl border-2 border-saffron-300 bg-white text-saffron-900 placeholder:text-saffron-400 focus:border-orange-400 focus:outline-none transition-all text-base resize-none"
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="donor-screenshot"
                              className="hindi-text text-saffron-800 font-semibold text-sm block mb-1.5"
                            >
                              भुगतान स्क्रीनशॉट{" "}
                              <span className="text-saffron-400 font-normal text-xs">
                                (वैकल्पिक)
                              </span>
                            </label>
                            <label
                              htmlFor="donor-screenshot"
                              data-ocid="donation.upload_button"
                              className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-orange-300 rounded-xl cursor-pointer bg-white hover:bg-orange-50 transition-colors overflow-hidden"
                            >
                              {screenshotPreview ? (
                                <img
                                  src={screenshotPreview}
                                  alt="Screenshot preview"
                                  className="h-full w-full object-contain rounded-xl"
                                />
                              ) : (
                                <div className="flex flex-col items-center gap-1 text-saffron-500">
                                  <span className="text-3xl">📷</span>
                                  <span className="hindi-text text-sm">
                                    स्क्रीनशॉट अपलोड करें
                                  </span>
                                  <span className="text-xs text-saffron-400">
                                    JPG, PNG
                                  </span>
                                </div>
                              )}
                              <input
                                id="donor-screenshot"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0] ?? null;
                                  setScreenshotFile(file);
                                  if (file) {
                                    compressImageToBase64(file, 600, 0.6)
                                      .then(setScreenshotPreview)
                                      .catch(() => setScreenshotPreview(null));
                                  } else {
                                    setScreenshotPreview(null);
                                  }
                                }}
                              />
                            </label>
                            {screenshotPreview && (
                              <button
                                type="button"
                                onClick={() => {
                                  setScreenshotFile(null);
                                  setScreenshotPreview(null);
                                }}
                                className="hindi-text text-xs text-red-500 mt-1 hover:underline"
                              >
                                हटाएं
                              </button>
                            )}
                          </div>
                          {submitError && (
                            <div
                              data-ocid="donation.error_state"
                              className="hindi-text text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm"
                            >
                              {submitError}
                            </div>
                          )}
                          <button
                            type="submit"
                            disabled={submitting}
                            data-ocid="donation.submit_button"
                            className="hindi-text w-full py-4 rounded-xl font-bold text-lg text-white flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                            style={{
                              background:
                                "linear-gradient(135deg, #E8520A, #C93D00)",
                            }}
                          >
                            {submitting ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>सबमिट हो रहा है...</span>
                              </>
                            ) : (
                              <>
                                <span>🙏</span>
                                <span>विवरण सबमिट करें</span>
                              </>
                            )}
                          </button>
                        </motion.form>
                      )}
                    </AnimatePresence>
                  </div>
                  {/* end p-6 inner padding */}
                </div>
              </motion.div>

              <p className="hindi-text text-saffron-800 text-2xl font-bold mt-8">
                धन्यवाद! 🙏
              </p>

              {/* Membership CTA */}
              <div
                className="mt-8 p-5 rounded-2xl"
                style={{
                  background: "linear-gradient(135deg, #fff8e8, #fff3d0)",
                  border: "2px solid #E8A020",
                }}
              >
                <p className="hindi-text text-saffron-800 font-bold text-lg mb-1">
                  🤝 समिति के सदस्य बनें
                </p>
                <p className="hindi-text text-saffron-600 text-sm mb-3">
                  हमारी टीम से जुड़ें और समाज सेवा में भागीदार बनें
                </p>
                <button
                  type="button"
                  data-ocid="donation.member_button"
                  onClick={() => {
                    setMemberFormOpen(true);
                    setMemberSubmitted(false);
                  }}
                  className="hindi-text font-bold px-6 py-2.5 rounded-xl text-white flex items-center gap-2 mx-auto"
                  style={{
                    background: "linear-gradient(135deg, #E8520A, #C93D00)",
                  }}
                >
                  <Users className="w-4 h-4" />
                  सदस्यता फॉर्म भरें
                </button>
              </div>

              {/* Admin button moved to floating side button */}
            </motion.div>
          </div>
        </section>

        {/* ── ID CARD LOOKUP SECTION ── */}
        <section
          id="idcard"
          className="py-20 px-4"
          style={{
            background:
              "linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fde68a 100%)",
          }}
        >
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="text-center mb-10"
            >
              <div className="inline-flex items-center gap-2 bg-saffron-100 border border-saffron-300 rounded-full px-4 py-1.5 mb-4">
                <span className="text-lg">🪪</span>
                <span className="hindi-text text-saffron-700 text-sm font-semibold">
                  सदस्यता ID Card
                </span>
              </div>
              <h2 className="hindi-text text-3xl font-bold text-saffron-800 mb-2">
                अपना ID Card देखें
              </h2>
              <p className="hindi-text text-saffron-600 mb-2">
                सदस्यता आवेदन की स्थिति जांचें
              </p>
              <div className="mt-4 bg-saffron-50 border border-saffron-300 rounded-xl px-5 py-4 text-left">
                <p className="hindi-text text-saffron-800 text-sm font-semibold mb-1">
                  📌 सदस्यता के लिए:
                </p>
                <ol className="hindi-text text-saffron-700 text-sm space-y-1 list-decimal list-inside">
                  <li>
                    हमारी सदस्यता बनाने के लिए <strong>दान करें</strong>
                  </li>
                  <li>
                    अपना योगदान payment करके{" "}
                    <strong>screenshot submit करें</strong>
                  </li>
                  <li>
                    आपकी payment जाँच करके <strong>Admin approval</strong> करेगा
                  </li>
                  <li>
                    Approval के बाद आपका <strong>ID Card</strong> यहाँ मिलेगा
                  </li>
                </ol>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-saffron-200 p-6 md:p-8"
            >
              <div className="space-y-4 mb-6">
                <div>
                  <label
                    htmlFor="lookup-name"
                    className="hindi-text text-sm font-semibold text-saffron-700 block mb-1.5"
                  >
                    आपका नाम
                  </label>
                  <input
                    id="lookup-name"
                    type="text"
                    data-ocid="member_lookup.input"
                    value={memberLookupName}
                    onChange={(e) => setMemberLookupName(e.target.value)}
                    placeholder="जैसा आवेदन में भरा था"
                    className="hindi-text w-full px-4 py-3 rounded-xl border border-saffron-300 focus:outline-none focus:ring-2 focus:ring-saffron-400 bg-white text-saffron-800 placeholder-saffron-300"
                  />
                </div>
                <div>
                  <label
                    htmlFor="lookup-phone"
                    className="hindi-text text-sm font-semibold text-saffron-700 block mb-1.5"
                  >
                    मोबाइल नंबर
                  </label>
                  <input
                    id="lookup-phone"
                    type="tel"
                    data-ocid="member_lookup.search_input"
                    value={memberLookupPhone}
                    onChange={(e) => setMemberLookupPhone(e.target.value)}
                    placeholder="10 अंकों का मोबाइल नंबर"
                    className="hindi-text w-full px-4 py-3 rounded-xl border border-saffron-300 focus:outline-none focus:ring-2 focus:ring-saffron-400 bg-white text-saffron-800 placeholder-saffron-300"
                    onKeyDown={(e) => e.key === "Enter" && handleMemberLookup()}
                  />
                </div>
                <button
                  type="button"
                  data-ocid="member_lookup.submit_button"
                  onClick={handleMemberLookup}
                  disabled={
                    memberLookupLoading ||
                    !memberLookupName.trim() ||
                    !memberLookupPhone.trim()
                  }
                  className="hindi-text w-full py-3 rounded-xl font-bold text-white text-base transition-all disabled:opacity-50"
                  style={{
                    background: "linear-gradient(135deg, #E8520A, #C93D00)",
                  }}
                >
                  {memberLookupLoading ? "खोज रहे हैं..." : "🔍 स्थिति जांचें"}
                </button>
              </div>

              {/* Results */}
              {memberLookupLoading && (
                <div
                  data-ocid="member_lookup.loading_state"
                  className="text-center py-6"
                >
                  <div className="inline-block w-8 h-8 border-4 border-saffron-300 border-t-saffron-600 rounded-full animate-spin mb-3" />
                  <p className="hindi-text text-saffron-600">
                    जानकारी खोजी जा रही है...
                  </p>
                </div>
              )}

              {!memberLookupLoading && memberLookupResult === "not_found" && (
                <motion.div
                  data-ocid="member_lookup.error_state"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 border border-red-200 rounded-xl p-4 text-center"
                >
                  <p className="text-2xl mb-2">😔</p>
                  <p className="hindi-text text-red-700 font-semibold">
                    कोई आवेदन नहीं मिला।
                  </p>
                  <p className="hindi-text text-red-500 text-sm mt-1">
                    कृपया सही नाम और मोबाइल नंबर डालें।
                  </p>
                </motion.div>
              )}

              {!memberLookupLoading &&
                memberLookupResult &&
                memberLookupResult !== "not_found" &&
                memberLookupResult.status === "pending" && (
                  <motion.div
                    data-ocid="member_lookup.pending_state"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 text-center"
                  >
                    <p className="text-3xl mb-2">⏳</p>
                    <p className="hindi-text text-yellow-800 font-bold text-lg">
                      आवेदन प्रक्रिया में है
                    </p>
                    <p className="hindi-text text-yellow-700 text-sm mt-2">
                      Admin की स्वीकृति के बाद आप यहाँ भुगतान कर सकेंगे।
                    </p>
                    <div className="mt-3 bg-yellow-100 rounded-lg px-4 py-2">
                      <p className="hindi-text text-yellow-600 text-xs">
                        नाम:{" "}
                        <span className="font-semibold">
                          {memberLookupResult.name}
                        </span>
                      </p>
                    </div>
                  </motion.div>
                )}

              {!memberLookupLoading &&
                memberLookupResult &&
                memberLookupResult !== "not_found" &&
                memberLookupResult.status === "approved" &&
                !memberLookupResult.paymentDone && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                      <p className="text-2xl mb-1">✅</p>
                      <p className="hindi-text text-green-800 font-bold">
                        आपका आवेदन स्वीकृत हो गया है!
                      </p>
                      <p className="hindi-text text-green-600 text-sm mt-1">
                        अब सदस्यता शुल्क का भुगतान करें।
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="hindi-text text-saffron-700 font-semibold mb-3">
                        नीचे QR Code से भुगतान करें:
                      </p>
                      <img
                        src="/assets/uploads/IMG_20260314_020614_556-1.jpg"
                        alt="Payment QR Code"
                        className="w-48 h-48 object-contain mx-auto rounded-xl border-2 border-saffron-300 shadow-md"
                      />
                    </div>
                    {paymentProofSubmitted ? (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                        <p className="text-2xl mb-1">📸</p>
                        <p className="hindi-text text-blue-800 font-bold">
                          आपका payment screenshot submit हो गया।
                        </p>
                        <p className="hindi-text text-blue-600 text-sm mt-1">
                          Admin की जाँच के बाद आपका ID Card मिलेगा।
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="hindi-text text-saffron-700 font-semibold text-sm text-center">
                          भुगतान का screenshot अपलोड करें:
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          data-ocid="member_lookup.upload_button"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = (ev) =>
                              setPaymentScreenshotFile(
                                ev.target?.result as string,
                              );
                            reader.readAsDataURL(file);
                          }}
                          className="hindi-text w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-semibold file:bg-saffron-100 file:text-saffron-700 hover:file:bg-saffron-200 cursor-pointer"
                        />
                        <button
                          type="button"
                          data-ocid="member_lookup.submit_button"
                          onClick={() => {
                            setPaymentProofError("");
                            handleSubmitPaymentProof();
                          }}
                          disabled={
                            paymentProofSubmitting || !paymentScreenshotFile
                          }
                          className="hindi-text w-full py-3 rounded-xl font-bold text-white text-base transition-all disabled:opacity-50"
                          style={{
                            background:
                              "linear-gradient(135deg, #16a34a, #15803d)",
                          }}
                        >
                          {paymentProofSubmitting
                            ? "Submit हो रहा है..."
                            : "📤 Payment Screenshot Submit करें"}
                        </button>
                        {paymentProofError && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                            <p className="hindi-text text-red-700 text-sm font-semibold">
                              ❌ {paymentProofError}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}

              {!memberLookupLoading &&
                (showMemberIDCard ||
                  (memberLookupResult &&
                    memberLookupResult !== "not_found" &&
                    memberLookupResult.paymentDone)) &&
                memberLookupResult &&
                memberLookupResult !== "not_found" && (
                  <motion.div
                    data-ocid="member_lookup.success_state"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                      <p className="hindi-text text-green-700 font-semibold">
                        🎉 भुगतान की पुष्टि हो गई! आपका ID Card तैयार है।
                      </p>
                    </div>
                    <IDCardPreview member={memberLookupResult} />
                  </motion.div>
                )}
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
              {[
                {
                  url: INSTAGRAM_URL,
                  ocid: "social.instagram.button",
                  Icon: SiInstagram,
                  bg: "linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
                  name: "Instagram",
                  sub: "@shriramnavamiusari",
                },
                {
                  url: FACEBOOK_URL,
                  ocid: "social.facebook.button",
                  Icon: SiFacebook,
                  bg: "#1877F2",
                  name: "Facebook",
                  sub: "श्री राम नवमी उसरी",
                },
                {
                  url: YOUTUBE_URL,
                  ocid: "social.youtube.button",
                  Icon: SiYoutube,
                  bg: "#FF0000",
                  name: "YouTube",
                  sub: "@shriramnavamiusari",
                },
              ].map(({ url, ocid, Icon, bg, name, sub }, idx) => (
                <motion.a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-ocid={ocid}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.04, y: -4 }}
                  className="group bg-white/5 border border-saffron-600/40 rounded-2xl p-8 flex flex-col items-center gap-4 cursor-pointer hover:bg-white/10 transition-all"
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg"
                    style={{ background: bg }}
                  >
                    <Icon size={30} />
                  </div>
                  <div>
                    <p className="font-bold text-saffron-300 text-lg">{name}</p>
                    <p className="hindi-text text-saffron-500 text-sm">{sub}</p>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ── FLOATING ADMIN BUTTON ── */}
      <button
        type="button"
        data-ocid="admin.open_modal_button"
        onClick={() => setAdminOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center justify-center gap-1 py-3 px-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
        style={{
          background:
            "linear-gradient(180deg, rgba(30,15,5,0.85), rgba(45,20,5,0.90))",
          borderRadius: "10px 0 0 10px",
          border: "1px solid rgba(232,82,10,0.5)",
          borderRight: "none",
          boxShadow: "-3px 0 15px rgba(0,0,0,0.4)",
        }}
        title="Admin Panel"
      >
        <Shield className="w-4 h-4 text-saffron-400" />
        <span className="hindi-text text-saffron-400 text-[10px] font-bold [writing-mode:vertical-rl] [text-orientation:mixed] tracking-widest">
          ADMIN
        </span>
        <Lock className="w-3 h-3 text-saffron-600" />
      </button>

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
          <div className="mb-6 space-y-2">
            <p className="hindi-text text-saffron-300 font-semibold text-sm">
              📞 संपर्क करें
            </p>
            <p className="text-saffron-400 text-sm">
              <a
                href="mailto:ramnavami841236@gmail.com"
                className="hover:text-saffron-200 underline"
              >
                ramnavami841236@gmail.com
              </a>
            </p>
            <p className="text-saffron-400 text-sm">
              <a href="tel:9889729940" className="hover:text-saffron-200">
                📱 9889729940
              </a>
            </p>
          </div>
          <div className="border-t border-saffron-700/40 pt-5 space-y-4">
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
            <div
              className="inline-block px-6 py-3 rounded-2xl"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.25 0.08 50 / 0.6), oklch(0.30 0.10 55 / 0.4))",
                border: "1.5px solid oklch(0.62 0.18 50 / 0.6)",
                boxShadow:
                  "0 0 20px oklch(0.62 0.18 50 / 0.15), inset 0 1px 0 oklch(0.75 0.14 58 / 0.2)",
              }}
            >
              <p className="text-saffron-300 text-xl font-semibold tracking-wide">
                🎨 Website Designed by:{" "}
                <span
                  className="font-bold"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.82 0.14 65), oklch(0.72 0.18 55), oklch(0.82 0.14 65))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Prakash Kumar
                </span>{" "}
                ✨
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* ── MEMBERSHIP FORM MODAL ── */}
      <AnimatePresence>
        {memberFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.75)" }}
            onClick={(e) =>
              e.target === e.currentTarget &&
              !memberSubmitting &&
              setMemberFormOpen(false)
            }
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
              data-ocid="member.dialog"
              className="relative w-full max-w-lg rounded-2xl overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #fff8e8, #fff3d0)",
                border: "2px solid #E8A020",
                boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
                maxHeight: "90vh",
                overflowY: "auto",
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-6 py-4"
                style={{
                  background: "linear-gradient(135deg, #E8520A, #C93D00)",
                }}
              >
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-white" />
                  <div>
                    <h2 className="hindi-text text-white font-bold text-xl">
                      सदस्यता फॉर्म
                    </h2>
                    <p className="hindi-text text-orange-100 text-xs">
                      श्री राम नवमी सेवा समिति
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  data-ocid="member.close_button"
                  onClick={() => setMemberFormOpen(false)}
                  className="text-white hover:text-orange-200 transition-colors p-1"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="px-6 py-6">
                <AnimatePresence mode="wait">
                  {memberSubmitted ? (
                    <motion.div
                      key="member-success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      data-ocid="member.success_state"
                      className="text-center py-8"
                    >
                      <div className="text-6xl mb-4">🙏</div>
                      <h3 className="hindi-text text-2xl font-bold text-saffron-800 mb-3">
                        आवेदन सफलतापूर्वक सबमिट हो गया!
                      </h3>
                      <div className="bg-orange-50 border-2 border-orange-300 rounded-2xl px-6 py-5 mb-6">
                        <p className="hindi-text text-orange-800 font-bold text-lg">
                          हमारी टीम आप से जल्द ही संपर्क करेगी
                        </p>
                        <p className="hindi-text text-orange-600 text-sm mt-1">
                          आपका आवेदन प्राप्त हो गया है। समिति द्वारा जल्द ही आपसे संपर्क
                          किया जाएगा।
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setMemberFormOpen(false)}
                        className="hindi-text px-8 py-3 rounded-xl font-bold text-white"
                        style={{
                          background:
                            "linear-gradient(135deg, #E8520A, #C93D00)",
                        }}
                      >
                        ठीक है
                      </button>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="member-form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleMemberFormSubmit}
                      className="space-y-4"
                    >
                      <p className="hindi-text text-saffron-700 text-sm text-center mb-4">
                        सदस्यता के लिए नीचे अपना विवरण भरें
                      </p>

                      {/* Name */}
                      <div>
                        <label
                          htmlFor="member-name"
                          className="hindi-text text-saffron-800 font-semibold text-sm block mb-1"
                        >
                          नाम <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="member-name"
                          type="text"
                          required
                          value={memberName}
                          onChange={(e) => setMemberName(e.target.value)}
                          placeholder="पूरा नाम"
                          data-ocid="member.input"
                          className="hindi-text w-full px-4 py-3 rounded-xl border-2 border-saffron-300 bg-white text-saffron-900 placeholder:text-saffron-400 focus:border-orange-400 focus:outline-none transition-all text-base"
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label
                          htmlFor="member-phone"
                          className="hindi-text text-saffron-800 font-semibold text-sm block mb-1"
                        >
                          मोबाइल नंबर <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="member-phone"
                          type="tel"
                          required
                          value={memberPhone}
                          onChange={(e) => setMemberPhone(e.target.value)}
                          placeholder="10 अंकों का मोबाइल नंबर"
                          data-ocid="member.input"
                          className="hindi-text w-full px-4 py-3 rounded-xl border-2 border-saffron-300 bg-white text-saffron-900 placeholder:text-saffron-400 focus:border-orange-400 focus:outline-none transition-all text-base"
                        />
                      </div>

                      {/* Address */}
                      <div>
                        <label
                          htmlFor="member-address"
                          className="hindi-text text-saffron-800 font-semibold text-sm block mb-1"
                        >
                          पता <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          id="member-address"
                          rows={2}
                          required
                          value={memberAddress}
                          onChange={(e) => setMemberAddress(e.target.value)}
                          placeholder="पूरा पता लिखें"
                          data-ocid="member.textarea"
                          className="hindi-text w-full px-4 py-3 rounded-xl border-2 border-saffron-300 bg-white text-saffron-900 placeholder:text-saffron-400 focus:border-orange-400 focus:outline-none transition-all text-base resize-none"
                        />
                      </div>

                      {/* Occupation / Role */}
                      <div>
                        <label
                          htmlFor="member-occupation"
                          className="hindi-text text-saffron-800 font-semibold text-sm block mb-1"
                        >
                          दायित्व / व्यवसाय{" "}
                          <span className="text-saffron-400 font-normal text-xs">
                            (वैकल्पिक)
                          </span>
                        </label>
                        <input
                          id="member-occupation"
                          type="text"
                          value={memberOccupation}
                          onChange={(e) => setMemberOccupation(e.target.value)}
                          placeholder="जैसे: सदस्य, कोषाध्यक्ष, स्वयंसेवक"
                          data-ocid="member.input"
                          className="hindi-text w-full px-4 py-3 rounded-xl border-2 border-saffron-300 bg-white text-saffron-900 placeholder:text-saffron-400 focus:border-orange-400 focus:outline-none transition-all text-base"
                        />
                      </div>

                      {/* Photo Upload */}
                      <div>
                        <label
                          htmlFor="member-photo"
                          className="hindi-text text-saffron-800 font-semibold text-sm block mb-1"
                        >
                          फोटो <span className="text-red-500">*</span>
                        </label>
                        <label
                          htmlFor="member-photo"
                          data-ocid="member.upload_button"
                          className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-orange-300 rounded-xl cursor-pointer bg-white hover:bg-orange-50 transition-colors overflow-hidden"
                        >
                          {memberPhotoPreview ? (
                            <img
                              src={memberPhotoPreview}
                              alt="Member preview"
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <div className="flex flex-col items-center gap-1 text-orange-400">
                              <span className="text-4xl">🤳</span>
                              <span className="hindi-text text-sm font-medium">
                                अपनी फोटो अपलोड करें
                              </span>
                              <span className="text-xs text-orange-300">
                                JPG, PNG
                              </span>
                            </div>
                          )}
                          <input
                            id="member-photo"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0] ?? null;
                              setMemberPhotoFile(file);
                              if (file) {
                                compressImageToBase64(file, 150, 0.3)
                                  .then(setMemberPhotoPreview)
                                  .catch(() => setMemberPhotoPreview(null));
                              } else {
                                setMemberPhotoPreview(null);
                              }
                            }}
                          />
                        </label>
                        {memberPhotoPreview && (
                          <button
                            type="button"
                            onClick={() => {
                              setMemberPhotoFile(null);
                              setMemberPhotoPreview(null);
                            }}
                            className="hindi-text text-xs text-red-500 mt-1 hover:underline"
                          >
                            फोटो हटाएं
                          </button>
                        )}
                      </div>

                      {memberSubmitError && (
                        <div
                          data-ocid="member.error_state"
                          className="hindi-text text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm"
                        >
                          {memberSubmitError}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={memberSubmitting}
                        data-ocid="member.submit_button"
                        className="hindi-text w-full py-4 rounded-xl font-bold text-lg text-white flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        style={{
                          background:
                            "linear-gradient(135deg, #E8520A, #C93D00)",
                        }}
                      >
                        {memberSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>सबमिट हो रहा है...</span>
                          </>
                        ) : (
                          <>
                            <Users className="w-5 h-5" />
                            <span>सदस्यता आवेदन करें</span>
                          </>
                        )}
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ADMIN PANEL (Login overlay / Full-screen dashboard) ── */}
      <AnimatePresence>
        {adminOpen && !adminAuthenticated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.75)" }}
            onClick={(e) => e.target === e.currentTarget && handleAdminClose()}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 24 }}
              transition={{ type: "spring", bounce: 0.28, duration: 0.4 }}
              data-ocid="admin.dialog"
              className="relative w-full max-w-sm rounded-2xl overflow-hidden"
              style={{
                background: "#fff",
                boxShadow: "0 32px 96px rgba(0,0,0,0.45)",
              }}
            >
              <div
                className="h-1.5 w-full"
                style={{
                  background:
                    "linear-gradient(90deg, oklch(0.62 0.18 45), oklch(0.72 0.16 55), oklch(0.62 0.18 45))",
                }}
              />
              <div className="px-8 py-8">
                <div className="text-center mb-7">
                  <div
                    className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.62 0.18 45), oklch(0.55 0.16 40))",
                    }}
                  >
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h3
                    className="hindi-text text-2xl font-bold"
                    style={{ color: "oklch(0.25 0.05 45)" }}
                  >
                    Admin Login
                  </h3>
                  <p
                    className="hindi-text text-sm mt-1"
                    style={{ color: "oklch(0.5 0.06 45)" }}
                  >
                    कृपया अपनी जानकारी दर्ज करें
                  </p>
                </div>
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div>
                    <label
                      htmlFor="admin-userid"
                      className="hindi-text block text-xs font-bold mb-1.5 uppercase tracking-wider"
                      style={{ color: "oklch(0.45 0.08 45)" }}
                    >
                      User ID
                    </label>
                    <div className="relative">
                      <User
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                        style={{ color: "oklch(0.65 0.10 45)" }}
                      />
                      <input
                        type="text"
                        value={adminUserId}
                        onChange={(e) => setAdminUserId(e.target.value)}
                        placeholder="User ID दर्ज करें"
                        id="admin-userid"
                        data-ocid="admin.input"
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-sm transition-all outline-none"
                        style={{
                          border: "1.5px solid oklch(0.88 0.05 45)",
                          background: "oklch(0.98 0.01 80)",
                          color: "oklch(0.25 0.05 45)",
                        }}
                        onFocus={(e) => {
                          (e.target as HTMLInputElement).style.borderColor =
                            "oklch(0.62 0.18 45)";
                          (e.target as HTMLInputElement).style.boxShadow =
                            "0 0 0 3px oklch(0.62 0.18 45 / 0.15)";
                        }}
                        onBlur={(e) => {
                          (e.target as HTMLInputElement).style.borderColor =
                            "oklch(0.88 0.05 45)";
                          (e.target as HTMLInputElement).style.boxShadow =
                            "none";
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="admin-password"
                      className="hindi-text block text-xs font-bold mb-1.5 uppercase tracking-wider"
                      style={{ color: "oklch(0.45 0.08 45)" }}
                    >
                      Password
                    </label>
                    <div className="relative">
                      <Lock
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                        style={{ color: "oklch(0.65 0.10 45)" }}
                      />
                      <input
                        type="password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="Password दर्ज करें"
                        id="admin-password"
                        data-ocid="admin.password.input"
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-sm transition-all outline-none"
                        style={{
                          border: "1.5px solid oklch(0.88 0.05 45)",
                          background: "oklch(0.98 0.01 80)",
                          color: "oklch(0.25 0.05 45)",
                        }}
                        onFocus={(e) => {
                          (e.target as HTMLInputElement).style.borderColor =
                            "oklch(0.62 0.18 45)";
                          (e.target as HTMLInputElement).style.boxShadow =
                            "0 0 0 3px oklch(0.62 0.18 45 / 0.15)";
                        }}
                        onBlur={(e) => {
                          (e.target as HTMLInputElement).style.borderColor =
                            "oklch(0.88 0.05 45)";
                          (e.target as HTMLInputElement).style.boxShadow =
                            "none";
                        }}
                      />
                    </div>
                  </div>
                  {adminLoginError && (
                    <p
                      data-ocid="admin.error_state"
                      className="hindi-text text-sm text-center rounded-xl px-3 py-2.5"
                      style={{
                        color: "oklch(0.45 0.2 25)",
                        background: "oklch(0.97 0.03 25)",
                      }}
                    >
                      {adminLoginError}
                    </p>
                  )}
                  <button
                    type="submit"
                    data-ocid="admin.submit_button"
                    className="hindi-text w-full py-3 rounded-xl font-bold text-base text-white shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.62 0.18 45), oklch(0.55 0.16 40))",
                    }}
                  >
                    Login करें
                  </button>
                </form>
                <button
                  type="button"
                  data-ocid="admin.close_button"
                  onClick={handleAdminClose}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-gray-100"
                  style={{ color: "oklch(0.5 0.05 45)" }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ADMIN FULL-SCREEN DASHBOARD (after login) ── */}
      <AnimatePresence>
        {adminOpen && adminAuthenticated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] flex"
            style={{ background: "oklch(0.96 0.01 240)" }}
            data-ocid="admin.dialog"
          >
            {/* Sidebar */}
            <aside
              className="hidden md:flex flex-col flex-shrink-0 h-full"
              style={{
                width: "248px",
                background:
                  "linear-gradient(180deg, oklch(0.28 0.08 45) 0%, oklch(0.22 0.06 42) 100%)",
                borderRight: "1px solid oklch(0.32 0.09 45)",
              }}
            >
              <div
                className="px-6 py-6 border-b"
                style={{ borderColor: "oklch(0.35 0.08 45)" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "oklch(0.62 0.18 45)" }}
                  >
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="hindi-text font-bold text-white text-sm leading-tight">
                      Admin Panel
                    </p>
                    <p
                      className="hindi-text text-xs"
                      style={{ color: "oklch(0.72 0.10 55)" }}
                    >
                      श्री राम नवमी
                    </p>
                  </div>
                </div>
              </div>

              <nav className="flex-1 px-3 py-4 space-y-1">
                <button
                  type="button"
                  data-ocid="admin.donations.tab"
                  onClick={() => setAdminTab("donations")}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
                  style={
                    adminTab === "donations"
                      ? { background: "oklch(0.62 0.18 45)", color: "#fff" }
                      : { color: "oklch(0.80 0.06 55)" }
                  }
                >
                  <svg
                    className="w-5 h-5 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="hindi-text font-semibold text-sm flex-1">
                    दान इतिहास
                  </span>
                  {donations.length > 0 && (
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={
                        adminTab === "donations"
                          ? {
                              background: "rgba(255,255,255,0.25)",
                              color: "#fff",
                            }
                          : { background: "oklch(0.62 0.18 45)", color: "#fff" }
                      }
                    >
                      {donations.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  data-ocid="admin.members.tab"
                  onClick={() => setAdminTab("members")}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
                  style={
                    adminTab === "members"
                      ? { background: "oklch(0.62 0.18 45)", color: "#fff" }
                      : { color: "oklch(0.80 0.06 55)" }
                  }
                >
                  <Users className="w-5 h-5 flex-shrink-0" />
                  <span className="hindi-text font-semibold text-sm flex-1">
                    सदस्यता आवेदन
                  </span>
                  {memberApplications.length > 0 && (
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={
                        adminTab === "members"
                          ? {
                              background: "rgba(255,255,255,0.25)",
                              color: "#fff",
                            }
                          : { background: "oklch(0.62 0.18 45)", color: "#fff" }
                      }
                    >
                      {memberApplications.length}
                    </span>
                  )}
                </button>
              </nav>

              <div
                className="px-3 py-4 border-t"
                style={{ borderColor: "oklch(0.35 0.08 45)" }}
              >
                <div
                  className="flex items-center gap-3 px-3 py-2 mb-2 rounded-xl"
                  style={{ background: "oklch(0.32 0.07 45)" }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "oklch(0.62 0.18 45)" }}
                  >
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-bold font-mono truncate">
                      ram841236
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "oklch(0.65 0.08 55)" }}
                    >
                      Administrator
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  data-ocid="admin.close_button"
                  onClick={handleAdminClose}
                  className="hindi-text w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all"
                  style={{
                    color: "oklch(0.80 0.10 25)",
                    background: "oklch(0.28 0.06 25 / 0.5)",
                  }}
                >
                  <X className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
              {/* Top header bar */}
              <header
                className="flex items-center justify-between px-6 py-4 flex-shrink-0"
                style={{
                  background: "#fff",
                  borderBottom: "1px solid oklch(0.92 0.02 240)",
                  boxShadow: "0 1px 4px oklch(0 0 0 / 0.06)",
                }}
              >
                <div>
                  <h1
                    className="hindi-text font-bold text-lg"
                    style={{ color: "oklch(0.22 0.05 45)" }}
                  >
                    {adminTab === "donations" ? "दान इतिहास" : "सदस्यता आवेदन"}
                  </h1>
                  <p
                    className="hindi-text text-xs mt-0.5"
                    style={{ color: "oklch(0.55 0.05 240)" }}
                  >
                    {adminTab === "donations"
                      ? `कुल ${donations.length} दान प्राप्त हुए`
                      : `कुल ${memberApplications.length} आवेदन`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex md:hidden gap-1">
                    <button
                      type="button"
                      data-ocid="admin.donations.tab"
                      onClick={() => setAdminTab("donations")}
                      className="hindi-text px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                      style={
                        adminTab === "donations"
                          ? { background: "oklch(0.62 0.18 45)", color: "#fff" }
                          : {
                              background: "oklch(0.95 0.02 80)",
                              color: "oklch(0.4 0.08 45)",
                            }
                      }
                    >
                      दान ({donations.length})
                    </button>
                    <button
                      type="button"
                      data-ocid="admin.members.tab"
                      onClick={() => setAdminTab("members")}
                      className="hindi-text px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                      style={
                        adminTab === "members"
                          ? { background: "oklch(0.62 0.18 45)", color: "#fff" }
                          : {
                              background: "oklch(0.95 0.02 80)",
                              color: "oklch(0.4 0.08 45)",
                            }
                      }
                    >
                      सदस्य ({memberApplications.length})
                    </button>
                  </div>
                  {adminTab === "members" && (
                    <button
                      type="button"
                      data-ocid="admin.members.refresh_button"
                      disabled={loadingMembers}
                      onClick={handleRefreshMembers}
                      className="hindi-text text-xs font-bold px-4 py-2 rounded-xl transition-all disabled:opacity-40 flex items-center gap-1.5"
                      style={{
                        background: "oklch(0.95 0.06 220)",
                        color: "oklch(0.35 0.12 220)",
                        border: "1.5px solid oklch(0.85 0.08 220)",
                      }}
                    >
                      {loadingMembers ? "लोड हो रहा है..." : "🔄 Refresh"}
                    </button>
                  )}
                  {adminTab === "donations" && (
                    <button
                      type="button"
                      data-ocid="admin.clear_history.button"
                      disabled={clearingHistory || donations.length === 0}
                      onClick={async () => {
                        if (
                          !window.confirm("क्या आप सभी दान इतिहास हटाना चाहते हैं?")
                        )
                          return;
                        setClearingHistory(true);
                        try {
                          if (actor) {
                            await actor.clearAllDonations();
                            setDonations([]);
                          }
                        } catch {
                          /* ignore */
                        } finally {
                          setClearingHistory(false);
                        }
                      }}
                      className="hindi-text text-xs font-bold px-4 py-2 rounded-xl transition-all disabled:opacity-40"
                      style={{
                        background: "oklch(0.97 0.03 25)",
                        color: "oklch(0.45 0.20 25)",
                        border: "1.5px solid oklch(0.88 0.08 25)",
                      }}
                    >
                      {clearingHistory ? "हटाया जा रहा है..." : "🗑 सभी हटाएं"}
                    </button>
                  )}
                  <button
                    type="button"
                    data-ocid="admin.close_button"
                    onClick={handleAdminClose}
                    className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                    style={{
                      background: "oklch(0.95 0.02 240)",
                      color: "oklch(0.4 0.05 240)",
                    }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </header>

              {/* Stats bar */}
              <div
                className="px-6 py-3 flex-shrink-0"
                style={{
                  background: "oklch(0.99 0.005 240)",
                  borderBottom: "1px solid oklch(0.93 0.02 240)",
                }}
              >
                {adminTab === "donations" ? (
                  <div className="flex gap-4">
                    <div
                      className="flex items-center gap-2 px-4 py-2 rounded-xl"
                      style={{
                        background: "#fff",
                        border: "1px solid oklch(0.90 0.04 55)",
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: "oklch(0.96 0.06 55)" }}
                      >
                        <svg
                          className="w-4 h-4"
                          style={{ color: "oklch(0.62 0.18 45)" }}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p
                          className="text-xl font-bold leading-none"
                          style={{ color: "oklch(0.25 0.08 45)" }}
                        >
                          {donations.length}
                        </p>
                        <p
                          className="hindi-text text-xs"
                          style={{ color: "oklch(0.55 0.06 45)" }}
                        >
                          कुल दान
                        </p>
                      </div>
                    </div>
                    <div
                      className="flex items-center gap-2 px-4 py-2 rounded-xl"
                      style={{
                        background: "#fff",
                        border: "1px solid oklch(0.90 0.04 145)",
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: "oklch(0.96 0.06 140)" }}
                      >
                        <svg
                          className="w-4 h-4"
                          style={{ color: "oklch(0.50 0.14 145)" }}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p
                          className="text-xl font-bold leading-none"
                          style={{ color: "oklch(0.25 0.06 145)" }}
                        >
                          ₹
                          {donations
                            .reduce(
                              (sum, d) => sum + (Number(d.amount) || 0),
                              0,
                            )
                            .toLocaleString("en-IN")}
                        </p>
                        <p
                          className="hindi-text text-xs"
                          style={{ color: "oklch(0.5 0.06 145)" }}
                        >
                          कुल राशि
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-4">
                    <div
                      className="flex items-center gap-2 px-4 py-2 rounded-xl"
                      style={{
                        background: "#fff",
                        border: "1px solid oklch(0.90 0.04 240)",
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: "oklch(0.96 0.04 240)" }}
                      >
                        <Users
                          className="w-4 h-4"
                          style={{ color: "oklch(0.45 0.12 240)" }}
                        />
                      </div>
                      <div>
                        <p
                          className="text-xl font-bold leading-none"
                          style={{ color: "oklch(0.25 0.06 240)" }}
                        >
                          {memberApplications.length}
                        </p>
                        <p
                          className="hindi-text text-xs"
                          style={{ color: "oklch(0.55 0.06 240)" }}
                        >
                          कुल आवेदन
                        </p>
                      </div>
                    </div>
                    <div
                      className="flex items-center gap-2 px-4 py-2 rounded-xl"
                      style={{
                        background: "#fff",
                        border: "1px solid oklch(0.90 0.04 145)",
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: "oklch(0.96 0.06 145)" }}
                      >
                        <svg
                          className="w-4 h-4"
                          style={{ color: "oklch(0.50 0.14 145)" }}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p
                          className="text-xl font-bold leading-none"
                          style={{ color: "oklch(0.25 0.06 145)" }}
                        >
                          {
                            memberApplications.filter(
                              (m) => m.status === "approved",
                            ).length
                          }
                        </p>
                        <p
                          className="hindi-text text-xs"
                          style={{ color: "oklch(0.5 0.06 145)" }}
                        >
                          स्वीकृत
                        </p>
                      </div>
                    </div>
                    <div
                      className="flex items-center gap-2 px-4 py-2 rounded-xl"
                      style={{
                        background: "#fff",
                        border: "1px solid oklch(0.90 0.06 80)",
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: "oklch(0.97 0.05 80)" }}
                      >
                        <svg
                          className="w-4 h-4"
                          style={{ color: "oklch(0.60 0.15 80)" }}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p
                          className="text-xl font-bold leading-none"
                          style={{ color: "oklch(0.35 0.10 80)" }}
                        >
                          {
                            memberApplications.filter(
                              (m) => m.status !== "approved",
                            ).length
                          }
                        </p>
                        <p
                          className="hindi-text text-xs"
                          style={{ color: "oklch(0.55 0.08 80)" }}
                        >
                          लंबित
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Scrollable content area */}
              <div className="flex-1 overflow-y-auto px-6 py-5">
                {adminTab === "donations" && (
                  <div>
                    {loadingDonations ? (
                      <div
                        data-ocid="admin.donations.loading_state"
                        className="flex items-center justify-center py-20 gap-3"
                        style={{ color: "oklch(0.62 0.18 45)" }}
                      >
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span className="hindi-text font-semibold">
                          लोड हो रहा है...
                        </span>
                      </div>
                    ) : donations.length === 0 ? (
                      <div
                        data-ocid="admin.donations.empty_state"
                        className="flex flex-col items-center justify-center py-24 gap-3"
                      >
                        <div
                          className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl"
                          style={{ background: "oklch(0.95 0.04 55)" }}
                        >
                          📭
                        </div>
                        <p
                          className="hindi-text font-semibold text-lg"
                          style={{ color: "oklch(0.45 0.06 240)" }}
                        >
                          अभी कोई दान विवरण नहीं है
                        </p>
                        <p
                          className="hindi-text text-sm"
                          style={{ color: "oklch(0.62 0.04 240)" }}
                        >
                          दान फॉर्म भरने के बाद यहाँ दिखेगा
                        </p>
                      </div>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {donations.map((d, idx) => (
                          <div
                            key={`d-${d.name}-${String(d.timestamp)}`}
                            data-ocid="admin.donations.item.1"
                            className="rounded-2xl overflow-hidden"
                            style={{
                              background: "#fff",
                              border: "1px solid oklch(0.92 0.03 55)",
                              boxShadow: "0 2px 8px oklch(0 0 0 / 0.05)",
                            }}
                          >
                            <div
                              className="h-1"
                              style={{
                                background:
                                  "linear-gradient(90deg, oklch(0.62 0.18 45), oklch(0.72 0.14 60))",
                              }}
                            />
                            <div className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                                    style={{
                                      background: "oklch(0.95 0.05 55)",
                                      color: "oklch(0.45 0.14 45)",
                                    }}
                                  >
                                    #{idx + 1}
                                  </span>
                                  <p
                                    className="hindi-text font-bold"
                                    style={{ color: "oklch(0.25 0.06 45)" }}
                                  >
                                    {d.name}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  data-ocid={`admin.donations.delete_button.${idx + 1}`}
                                  onClick={() => handleDeleteDonation(idx)}
                                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all flex-shrink-0"
                                  style={{
                                    color: "oklch(0.55 0.15 25)",
                                    background: "oklch(0.97 0.03 25)",
                                  }}
                                  title="हटाएं"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <div className="space-y-1.5 text-sm">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="text-xs font-semibold w-16 flex-shrink-0"
                                    style={{ color: "oklch(0.55 0.06 240)" }}
                                  >
                                    मोबाइल
                                  </span>
                                  <span
                                    className="hindi-text"
                                    style={{ color: "oklch(0.3 0.05 240)" }}
                                  >
                                    {d.phone}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span
                                    className="text-xs font-semibold w-16 flex-shrink-0"
                                    style={{ color: "oklch(0.55 0.06 240)" }}
                                  >
                                    राशि
                                  </span>
                                  <span
                                    className="font-bold"
                                    style={{ color: "oklch(0.45 0.18 145)" }}
                                  >
                                    ₹{d.amount}
                                  </span>
                                </div>
                                {d.note && (
                                  <div className="flex gap-2">
                                    <span
                                      className="text-xs font-semibold w-16 flex-shrink-0 pt-0.5"
                                      style={{ color: "oklch(0.55 0.06 240)" }}
                                    >
                                      संदेश
                                    </span>
                                    <span
                                      className="hindi-text text-xs"
                                      style={{ color: "oklch(0.45 0.04 240)" }}
                                    >
                                      {d.note}
                                    </span>
                                  </div>
                                )}
                                <p
                                  className="text-xs mt-1"
                                  style={{ color: "oklch(0.65 0.03 240)" }}
                                >
                                  {formatTimestamp(d.timestamp)}
                                </p>
                              </div>
                              {d.screenshot && (
                                <div
                                  className="mt-3 pt-3"
                                  style={{
                                    borderTop: "1px dashed oklch(0.90 0.04 55)",
                                  }}
                                >
                                  <p
                                    className="hindi-text text-xs font-semibold mb-1.5"
                                    style={{ color: "oklch(0.55 0.08 55)" }}
                                  >
                                    भुगतान स्क्रीनशॉट
                                  </p>
                                  <img
                                    src={d.screenshot}
                                    alt="Payment screenshot"
                                    className="max-h-28 w-full rounded-xl object-contain"
                                    style={{
                                      border: "1px solid oklch(0.90 0.04 55)",
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {adminTab === "members" && (
                  <div>
                    {loadingMembers ? (
                      <div
                        data-ocid="admin.members.loading_state"
                        className="flex items-center justify-center py-20 gap-3"
                        style={{ color: "oklch(0.62 0.18 45)" }}
                      >
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span className="hindi-text font-semibold">
                          लोड हो रहा है...
                        </span>
                      </div>
                    ) : memberApplications.length === 0 ? (
                      <div
                        data-ocid="admin.members.empty_state"
                        className="flex flex-col items-center justify-center py-24 gap-3"
                      >
                        <div
                          className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl"
                          style={{ background: "oklch(0.96 0.03 240)" }}
                        >
                          👥
                        </div>
                        <p
                          className="hindi-text font-semibold text-lg"
                          style={{ color: "oklch(0.45 0.06 240)" }}
                        >
                          अभी कोई सदस्यता आवेदन नहीं है
                        </p>
                        <p
                          className="hindi-text text-sm"
                          style={{ color: "oklch(0.62 0.04 240)" }}
                        >
                          सदस्यता फॉर्म भरने के बाद यहाँ दिखेगा
                        </p>
                      </div>
                    ) : (
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {memberApplications.map((m, idx) => (
                          <div
                            key={String(m.id)}
                            data-ocid={`admin.members.item.${idx + 1}`}
                            className="rounded-2xl overflow-hidden"
                            style={{
                              background: "#fff",
                              border: "1px solid oklch(0.92 0.03 240)",
                              boxShadow: "0 2px 8px oklch(0 0 0 / 0.05)",
                            }}
                          >
                            <div
                              className="h-1"
                              style={{
                                background:
                                  m.status === "approved"
                                    ? "linear-gradient(90deg, oklch(0.50 0.14 145), oklch(0.60 0.12 155))"
                                    : "linear-gradient(90deg, oklch(0.72 0.12 80), oklch(0.78 0.10 90))",
                              }}
                            />
                            <div className="p-4">
                              <div className="flex items-start gap-3 mb-3">
                                <div
                                  className="w-14 h-16 rounded-xl overflow-hidden flex-shrink-0"
                                  style={{
                                    border: "2px solid oklch(0.90 0.04 55)",
                                    background: "oklch(0.96 0.03 55)",
                                  }}
                                >
                                  {m.photo ? (
                                    <img
                                      src={m.photo}
                                      alt=""
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-2xl">
                                      👤
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                    <span
                                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                                      style={{
                                        background: "oklch(0.95 0.04 240)",
                                        color: "oklch(0.40 0.10 240)",
                                      }}
                                    >
                                      #{idx + 1}
                                    </span>
                                    <span
                                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                                      style={
                                        m.status === "approved"
                                          ? {
                                              background:
                                                "oklch(0.95 0.06 145)",
                                              color: "oklch(0.40 0.14 145)",
                                            }
                                          : {
                                              background: "oklch(0.97 0.05 80)",
                                              color: "oklch(0.50 0.14 80)",
                                            }
                                      }
                                    >
                                      {m.status === "approved"
                                        ? "✅ स्वीकृत"
                                        : "⏳ लंबित"}
                                    </span>
                                  </div>
                                  <p
                                    className="hindi-text font-bold truncate"
                                    style={{ color: "oklch(0.25 0.06 45)" }}
                                  >
                                    {m.name}
                                  </p>
                                  <p
                                    className="hindi-text text-xs"
                                    style={{ color: "oklch(0.55 0.06 240)" }}
                                  >
                                    {m.phone}
                                  </p>
                                </div>
                              </div>

                              <div
                                className="space-y-1 text-xs mb-3"
                                style={{
                                  borderTop: "1px solid oklch(0.93 0.02 240)",
                                  paddingTop: "10px",
                                }}
                              >
                                <div className="flex gap-2">
                                  <span
                                    className="font-semibold w-14 flex-shrink-0"
                                    style={{ color: "oklch(0.55 0.06 240)" }}
                                  >
                                    पता
                                  </span>
                                  <span
                                    className="hindi-text"
                                    style={{ color: "oklch(0.35 0.05 240)" }}
                                  >
                                    {m.address}
                                  </span>
                                </div>
                                {m.occupation && (
                                  <div className="flex gap-2">
                                    <span
                                      className="font-semibold w-14 flex-shrink-0"
                                      style={{ color: "oklch(0.55 0.06 240)" }}
                                    >
                                      दायित्व
                                    </span>
                                    <span
                                      className="hindi-text"
                                      style={{ color: "oklch(0.35 0.05 240)" }}
                                    >
                                      {m.occupation}
                                    </span>
                                  </div>
                                )}
                                <div className="flex gap-2">
                                  <span
                                    className="font-semibold w-14 flex-shrink-0"
                                    style={{ color: "oklch(0.55 0.06 240)" }}
                                  >
                                    भुगतान
                                  </span>
                                  <span
                                    className="font-bold"
                                    style={
                                      m.paymentDone
                                        ? { color: "oklch(0.45 0.14 145)" }
                                        : { color: "oklch(0.60 0.06 240)" }
                                    }
                                  >
                                    {m.paymentDone
                                      ? "💰 हुआ"
                                      : m.paymentScreenshot &&
                                          m.paymentScreenshot !== ""
                                        ? "📸 Screenshot मिला"
                                        : "बाकी"}
                                  </span>
                                </div>
                                {m.paymentScreenshot &&
                                  m.paymentScreenshot !== "" &&
                                  !m.paymentDone && (
                                    <div className="mt-2">
                                      <p
                                        className="text-xs font-semibold mb-1"
                                        style={{
                                          color: "oklch(0.55 0.06 240)",
                                        }}
                                      >
                                        Payment Screenshot:
                                      </p>
                                      <img
                                        src={m.paymentScreenshot}
                                        alt="Payment proof"
                                        className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                                      />
                                    </div>
                                  )}
                                <p style={{ color: "oklch(0.70 0.03 240)" }}>
                                  {formatTimestamp(m.timestamp)}
                                </p>
                              </div>

                              <div className="flex gap-2">
                                {m.status !== "approved" && (
                                  <button
                                    type="button"
                                    data-ocid={`admin.members.confirm_button.${idx + 1}`}
                                    onClick={() => handleApproveMember(m.id)}
                                    className="hindi-text flex-1 py-2 rounded-xl font-bold text-xs text-white transition-all hover:opacity-90"
                                    style={{
                                      background:
                                        "linear-gradient(135deg, oklch(0.50 0.16 145), oklch(0.44 0.14 145))",
                                    }}
                                  >
                                    ✅ स्वीकृत करें
                                  </button>
                                )}
                                {m.status === "approved" &&
                                  m.paymentScreenshot &&
                                  m.paymentScreenshot !== "" &&
                                  !m.paymentDone && (
                                    <button
                                      type="button"
                                      data-ocid={`admin.members.confirm_button.${idx + 1}`}
                                      onClick={() =>
                                        handleAdminConfirmPayment(m.id)
                                      }
                                      className="hindi-text flex-1 py-2 rounded-xl font-bold text-xs text-white transition-all hover:opacity-90"
                                      style={{
                                        background:
                                          "linear-gradient(135deg, oklch(0.50 0.16 145), oklch(0.44 0.14 145))",
                                      }}
                                    >
                                      💰 Payment Confirm करें
                                    </button>
                                  )}
                                {m.status === "approved" && (
                                  <button
                                    type="button"
                                    data-ocid={`admin.members.id_card_toggle.${idx + 1}`}
                                    onClick={() =>
                                      setExpandedMemberCard(
                                        expandedMemberCard === idx ? null : idx,
                                      )
                                    }
                                    className="hindi-text flex-1 py-2 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-1.5 transition-all hover:opacity-90"
                                    style={{
                                      background:
                                        "linear-gradient(135deg, oklch(0.62 0.18 45), oklch(0.55 0.16 40))",
                                    }}
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    {expandedMemberCard === idx
                                      ? "छुपाएं"
                                      : "ID Card"}
                                  </button>
                                )}
                                <button
                                  type="button"
                                  data-ocid={`admin.members.delete_button.${idx + 1}`}
                                  onClick={() => handleDeleteMember(m.id)}
                                  className="w-9 h-9 rounded-xl flex items-center justify-center text-sm transition-all hover:opacity-90"
                                  style={{
                                    background: "oklch(0.97 0.03 25)",
                                    color: "oklch(0.50 0.18 25)",
                                  }}
                                >
                                  🗑
                                </button>
                              </div>
                            </div>

                            <AnimatePresence>
                              {m.status === "approved" &&
                                expandedMemberCard === idx && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                    style={{
                                      borderTop:
                                        "1px solid oklch(0.92 0.03 55)",
                                    }}
                                  >
                                    <div
                                      className="px-4 py-5"
                                      style={{
                                        background: "oklch(0.99 0.01 80)",
                                      }}
                                    >
                                      <p
                                        className="hindi-text font-bold text-sm text-center mb-3"
                                        style={{ color: "oklch(0.45 0.12 45)" }}
                                      >
                                        ID Card Preview
                                      </p>
                                      <IDCardPreview member={m} />
                                    </div>
                                  </motion.div>
                                )}
                            </AnimatePresence>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
