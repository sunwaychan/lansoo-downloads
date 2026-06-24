import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Sun, Moon, Search, Download, Smartphone, Monitor,
  MapPin, Globe, Send, Star, ChevronUp, Cloud, Laptop,
} from "lucide-react";

const banners = [
  { id: 1, img: "https://img.lansoo.com/file/1756974582770_banner3.png" },
  { id: 2, img: "https://img.lansoo.com/file/1757093612782_image.png" },
  { id: 3, img: "https://img.lansoo.com/file/1764529703873_PixPin_2025-12-01_03-03-16.png", link: "https://blog.lansoo.com/" },
  { id: 4, img: "https://img.lansoo.com/file/1742103223415_PixPin_2025-03-16_13-33-33.png" },
  { id: 5, img: "https://img.lansoo.com/file/1757093478872_image.png" },
];

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const highlight = (text, query) => {
  if (!query) return text;
  const regex = new RegExp(`(${escapeRegExp(query)})`, "gi");
  return text.split(regex).map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-yellow-300 dark:bg-yellow-600 text-black dark:text-white px-1 rounded">{part}</mark>
    ) : (
      part
    )
  );
};

const App = () => {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [darkMode, setDarkMode] = useState(false);
  const [isManualToggle, setIsManualToggle] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [softwareData, setSoftwareData] = useState({});
  const [loading, setLoading] = useState(true);
  const searchRef = useRef(null);
  const [bannerPaused, setBannerPaused] = useState(false);

  const [visitorInfo, setVisitorInfo] = useState({ ip: "", country: "", city: "", device: "", time: "" });

  // 从 API 加载软件数据
  useEffect(() => {
    fetch("/api/software")
      .then(r => r.json())
      .then(data => { setSoftwareData(data); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, []);

  // 设备类型
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    const isMobile = /mobile|android|iphone|ipad/.test(ua);
    const width = window.innerWidth;
    let device = "PC";
    if (isMobile) device = "Mobile";
    else if (width <= 1440) device = "Notebook";
    setVisitorInfo(v => ({ ...v, device }));
  }, []);

  // 时间自动更新
  useEffect(() => {
    const tick = () => setVisitorInfo(v => ({ ...v, time: new Date().toLocaleString("zh-CN", { hour12: false }) }));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  // 获取 IP/城市
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/cdn-cgi/trace");
        const text = await res.text();
        const ip = text.match(/ip=(.*)/)?.[1]?.trim() || "";
        const country = text.match(/loc=(.*)/)?.[1]?.trim() || "";
        let city = "";
        try {
          const geo = await fetch(`https://ipapi.co/${ip}/json/`).then(r => r.json());
          city = geo.city || "";
        } catch {}
        setVisitorInfo(v => ({ ...v, ip, country, city }));
      } catch {}
    })();
  }, []);

  // Banner 自动轮播（hover 暂停）
  useEffect(() => {
    if (bannerPaused) return;
    const t = setInterval(() => setCurrentBanner(n => (n + 1) % banners.length), 4000);
    return () => clearInterval(t);
  }, [bannerPaused]);

  // 自动 Dark mode
  useEffect(() => {
    if (isManualToggle) return;
    const saved = localStorage.getItem("darkMode");
    if (saved !== null) { setDarkMode(saved === "true"); setIsManualToggle(true); return; }
    const hour = new Date().getHours();
    setDarkMode(hour >= 18 || hour < 6);
  }, [isManualToggle]);

  const toggleDarkMode = () => {
    setDarkMode(s => { localStorage.setItem("darkMode", !s); return !s; });
    setIsManualToggle(true);
  };

  const allCategories = ["全部", ...Object.keys(softwareData)];

  const filteredData = useMemo(() => {
    const q = query.toLowerCase();
    const filter = (sw) => sw.name.toLowerCase().includes(q) || sw.description.toLowerCase().includes(q);
    if (selectedCategory === "全部") {
      const result = {};
      for (const cat of Object.keys(softwareData)) {
        result[cat] = softwareData[cat].filter(filter);
      }
      return result;
    }
    return { [selectedCategory]: (softwareData[selectedCategory] || []).filter(filter) };
  }, [query, selectedCategory, softwareData]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">加载中...</div>;
  }

  return (
    <div className={darkMode ? "bg-gray-900 text-white min-h-screen" : "bg-gray-100 text-gray-900 min-h-screen"}>
      {/* 访客信息栏 */}
      <div className={`w-full text-sm py-3 shadow-md transition-colors ${darkMode ? "bg-gradient-to-r from-gray-800 to-gray-700 text-gray-200" : "bg-gradient-to-r from-blue-600 to-blue-500 text-white"}`}>
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap justify-between gap-2 items-center">
          <span className="flex items-center gap-1">
            {visitorInfo.device === "Mobile" ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
            {visitorInfo.device}
          </span>
          <span className="flex items-center gap-1"><Globe className="w-4 h-4" /> {visitorInfo.ip}</span>
          <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {visitorInfo.country} {visitorInfo.city}</span>
          <span>{visitorInfo.time}</span>
        </div>
      </div>

      {/* Banner 轮播 */}
      <div className="max-w-6xl mx-auto mt-6 px-4"
        onMouseEnter={() => setBannerPaused(true)}
        onMouseLeave={() => setBannerPaused(false)}>
        <div className="relative overflow-hidden rounded-2xl shadow-xl" style={{ aspectRatio: "3/1" }}>
          {banners.map((b, i) => (
            <a key={b.id} href={b.link || "#"} target={b.link ? "_blank" : undefined}
              className="absolute inset-0 transition-opacity duration-700"
              style={{ opacity: i === currentBanner ? 1 : 0, pointerEvents: i === currentBanner ? "auto" : "none" }}>
              <img src={b.img} alt="" className="w-full h-full object-cover" />
            </a>
          ))}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, i) => (
              <button key={i} onClick={() => setCurrentBanner(i)}
                className={`w-2.5 h-2.5 rounded-full transition ${i === currentBanner ? "bg-white" : "bg-white/40"}`} />
            ))}
          </div>
        </div>
      </div>

      {/* 搜索 + 分类 */}
      <div ref={searchRef} className="max-w-6xl mx-auto mt-6 px-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-5">
          <input
            value={query} onChange={e => setQuery(e.target.value)}
            placeholder="搜索软件名称或描述..."
            className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 outline-none focus:ring-2 focus:ring-blue-400 mb-4"
          />
          <div className="flex flex-wrap gap-2">
            {allCategories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300"
                }`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 软件列表 */}
      <div className="max-w-6xl mx-auto mt-8 px-4 pb-24">
        {Object.values(filteredData).every(arr => arr.length === 0) ? (
          <div className="text-center text-gray-400 p-8">没有找到与「{query}」相关的软件，请尝试其他关键词。</div>
        ) : (
          Object.entries(filteredData).map(([category, softwares]) =>
            softwares.length > 0 ? (
              <div key={category} className="mb-10">
                <h2 className="text-2xl font-bold mb-4 border-b pb-2 text-blue-600">{category}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {softwares.map((s, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-md hover:shadow-xl transition">
                      <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">{highlight(s.name, query)}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{highlight(s.description, query)}</p>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-xs text-gray-500">更新日期: {s.updatedAt}</span>
                        <a href={s.downloadUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null
          )
        )}
      </div>

      {/* 右下角浮动按钮 */}
      <div className="fixed right-4 bottom-6 flex flex-col gap-3 z-50">
        <button onClick={toggleDarkMode}
          className="w-12 h-12 rounded-full bg-gray-800 dark:bg-yellow-400 text-white dark:text-black flex items-center justify-center shadow-lg hover:scale-110 transition">
          {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
        </button>
        <button onClick={() => searchRef.current?.scrollIntoView({ behavior: "smooth" })}
          className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:scale-110 transition">
          <Search className="w-6 h-6" />
        </button>
        <button onClick={() => alert("请按 Ctrl + D 收藏本站")}
          className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center shadow-lg hover:scale-110 transition">
          <Star className="w-6 h-6" />
        </button>
        <button onClick={() => window.open("https://t.me/sunwaychan", "_blank")}
          className="w-12 h-12 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition">
          <Send className="w-6 h-6" />
        </button>
        <button onClick={() => window.open("https://cloudflare.com", "_blank")}
          className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition">
          <Cloud className="w-6 h-6" />
        </button>
        <button onClick={() => window.open("https://blog.lansoo.com", "_blank")}
          className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition">
          <Globe className="w-6 h-6" />
        </button>
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg hover:scale-110 transition">
          <ChevronUp className="w-6 h-6" />
        </button>
      </div>

      {/* 版权 */}
      <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
        Copyright© 2003-2025 LanSoo 远程技术支持 All Right Reserved || 本站所有分享收藏软件工具除特别声明外，均采用 CC BY-NC-SA 4.0 许可协议。
      </div>
    </div>
  );
};

export default App;