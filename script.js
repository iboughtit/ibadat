const QURAN_BASE = "https://quranapi.pages.dev/api";
const PRAYER_CITY_URL = "https://api.aladhan.com/v1/timingsByCity?city=Mumbai&country=India&method=2";
const STORAGE = {
  ayah: "namaz_ayah_daily",
  favorites: "namaz_ayah_favorites",
  tasbeeh: "namaz_ayah_tasbeeh",
  dhikr: "namaz_ayah_dhikr",
  notificationAsked: "namaz_ayah_notification_asked",
  settings: "namaz_ayah_settings",
  installDismissed: "namaz_ayah_install_dismissed_at",
  location: "namaz_ayah_location",
  recentAyahs: "namaz_ayah_recent_refs",
  quoteHistory: "namaz_ayah_quote_history"
};

const prayerNames = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
const displayPrayerNames = { Dhuhr: "Zuhr" };
const surahAyahCounts = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98,
  135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45, 83, 182, 88, 75,
  85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13,
  14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29,
  19, 36, 25, 22, 17, 19, 26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9,
  5, 4, 7, 3, 6, 3, 5, 4, 5, 6
];

const quotes = [
  ["Sabr karo, beshak Allah sabr karne walon ke saath hai.", "Roman Urdu"],
  ["La tahzan innallaha ma'ana.", "Quranic reminder"],
  ["Allah kisi jaan par uski taqat se zyada bojh nahi daalta.", "Roman Urdu"],
  ["Fa inna ma'al usri yusra.", "Quranic transliteration"],
  ["Hasbunallahu wa ni'mal wakeel.", "Dua"],
  ["Bismillahir Rahmanir Raheem.", "Quranic transliteration"],
  ["Alhamdulillahi Rabbil Aalameen.", "Quranic transliteration"],
  ["Ar Rahmanir Raheem.", "Quranic transliteration"],
  ["Ihdinas Siratal Mustaqeem.", "Dua"],
  ["Rabbana taqabbal minna innaka Antas Samee'ul Aleem.", "Dua"],
  ["Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan.", "Dua"],
  ["Allah par bharosa rakho, woh behtareen kaarsaz hai.", "Roman Urdu"],
  ["Dil ko sukoon Allah ke zikr se milta hai.", "Roman Urdu"],
  ["Namaz dil ko roshan karti hai.", "Roman Urdu"],
  ["Tawakkul rakho, Allah har raasta khol sakta hai.", "Roman Urdu"],
  ["Jo Allah ke qareeb hota hai, uska dil tanha nahi hota.", "Roman Urdu"],
  ["Astaghfirullah wa atubu ilaih.", "Istighfar"],
  ["SubhanAllahi wa bihamdihi.", "Dhikr"],
  ["La ilaha illa Anta subhanaka inni kuntu minaz-zalimeen.", "Dua"],
  ["Ya Allah, humein hidayat aur istiqamat ata farma.", "Roman Urdu"],
  ["Dua kabhi zaya nahi hoti; Allah behtareen waqt par ata karta hai.", "Roman Urdu"],
  ["Har mushkil ke baad asani hai.", "Roman Urdu"],
  ["Allah ke faisle mein hamesha hikmat hoti hai.", "Roman Urdu"],
  ["Quran dilon ke liye shifa hai.", "Roman Urdu"],
  ["Jo Allah ko yaad karta hai, Allah usay yaad rakhta hai.", "Roman Urdu"],
  ["Rabbighfir warham wa Anta khairur rahimeen.", "Dua"],
  ["Allahumma inni as'aluka husnal khatimah.", "Dua"],
  ["Sujood mein dil apne Rabb ke sab se qareeb hota hai.", "Roman Urdu"],
  ["Rizq Allah ke haath mein hai; dil ko pareshan na karo.", "Roman Urdu"],
  ["Tawbah ka darwaza hamesha khula hai.", "Roman Urdu"],
  ["Ya Muqallibal quloob, thabbit qalbi ala deenik.", "Dua"],
  ["Allahumma salli ala Muhammad.", "Salawat"],
  ["La hawla wa la quwwata illa billah.", "Dhikr"],
  ["Beshak Allah reham karne walon ko pasand farmata hai.", "Roman Urdu"],
  ["Neki chhoti ho ya badi, Allah ke nazdeek mehfooz rehti hai.", "Roman Urdu"],
  ["Apne Rabb se umeed kabhi mat todo.", "Roman Urdu"],
  ["Qalb ko paak rakho, zuban ko zikr se sajao.", "Roman Urdu"],
  ["Jo shukar karta hai, Allah usay aur ata karta hai.", "Roman Urdu"],
  ["Allah ki rehmat har gham se badi hai.", "Roman Urdu"],
  ["Rabbana zalamna anfusana wa illam taghfir lana lanakoonanna minal khasireen.", "Dua"]
];

const els = {};
let currentAyah = null;
let prayerData = null;
let deferredInstallPrompt = null;
let notificationTimers = [];
let countdownTimer = null;
let quoteTimer = null;
let activeAyahTab = "arabic";

document.addEventListener("DOMContentLoaded", init);

function init() {
  cacheElements();
  registerServiceWorker();
  bindEvents();
  initRevealAnimations();
  initParticles();
  restoreTasbeeh();
  renderFavorites();
  updateNetworkState();
  loadDailyAyah();
  loadSavedLocationOrDefault();
  rotateQuote();
  initInstallExperience();
  maybeShowNotificationPopup();
}

function cacheElements() {
  [
    "arabicText", "translationText", "romanText", "surahRef", "reciterName", "ayahLoader",
    "ayahContent", "refreshAyahBtn", "randomHeroBtn", "playAudioBtn", "copyAyahBtn", "shareAyahBtn",
    "saveAyahBtn", "ayahAudio", "prayerGrid", "nextPrayerName", "nextPrayerTime", "countdown",
    "locationLabel", "hijriDate", "onlineState", "favoriteCount", "detectLocationBtn", "tasbeehBtn",
    "tasbeehCount", "resetTasbeehBtn", "currentDhikr", "favoritesList", "clearFavoritesBtn",
    "enableNotificationsBtn", "notifyTopBtn", "permissionModal", "closePermissionBtn", "modalEnableBtn",
    "installBtn", "installNavBtn", "installMenuBtn", "installModal", "closeInstallBtn", "installNowBtn",
    "maybeLaterBtn", "iosInstallSteps", "installDescription", "ayahTabPanel", "ayahTabText", "toast",
    "quoteText", "quoteSource", "prayerAlertsToggle", "ayahAlertsToggle"
  ].forEach((id) => els[id] = document.getElementById(id));
  els.navToggle = document.querySelector(".nav-toggle");
  els.navLinks = document.getElementById("navLinks");
  els.presetButtons = document.querySelectorAll(".tasbeeh-presets button");
  els.ayahTabs = document.querySelectorAll(".ayah-tab");
  els.installButtons = [els.installBtn, els.installNavBtn, els.installMenuBtn].filter(Boolean);
}

function bindEvents() {
  els.refreshAyahBtn.addEventListener("click", () => loadRandomAyah(true));
  els.randomHeroBtn.addEventListener("click", () => document.getElementById("ayah").scrollIntoView({ behavior: "smooth" }) || loadRandomAyah(true));
  els.playAudioBtn.addEventListener("click", playAyahAudio);
  els.copyAyahBtn.addEventListener("click", copyCurrentAyah);
  els.shareAyahBtn.addEventListener("click", shareCurrentAyah);
  els.saveAyahBtn.addEventListener("click", saveCurrentAyah);
  els.detectLocationBtn.addEventListener("click", detectLocation);
  els.tasbeehBtn.addEventListener("click", incrementTasbeeh);
  els.resetTasbeehBtn.addEventListener("click", resetTasbeeh);
  els.clearFavoritesBtn.addEventListener("click", clearFavorites);
  els.enableNotificationsBtn.addEventListener("click", enableNotifications);
  els.notifyTopBtn.addEventListener("click", enableNotifications);
  els.modalEnableBtn.addEventListener("click", enableNotifications);
  els.closePermissionBtn.addEventListener("click", closePermissionModal);
  els.navToggle.addEventListener("click", toggleNav);
  els.navLinks.addEventListener("click", (event) => {
    if (event.target.matches("a")) closeNav();
  });
  els.installButtons.forEach((button) => button.addEventListener("click", () => {
    closeNav();
    openInstallModal(true);
  }));
  els.closeInstallBtn.addEventListener("click", dismissInstallModal);
  els.maybeLaterBtn.addEventListener("click", dismissInstallModal);
  els.installNowBtn.addEventListener("click", installApp);
  els.installModal.addEventListener("click", (event) => {
    if (event.target === els.installModal) dismissInstallModal();
  });
  els.ayahTabs.forEach((button) => button.addEventListener("click", () => setAyahTab(button.dataset.tab)));
  els.prayerAlertsToggle.addEventListener("change", saveNotificationSettings);
  els.ayahAlertsToggle.addEventListener("change", saveNotificationSettings);
  els.presetButtons.forEach((button) => button.addEventListener("click", () => setDhikr(button.dataset.dhikr)));
  window.addEventListener("online", updateNetworkState);
  window.addEventListener("offline", updateNetworkState);
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    updateInstallButtons();
    scheduleInstallPopup();
  });
  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    closeInstallModal(false);
    updateInstallButtons();
    localStorage.removeItem(STORAGE.installDismissed);
    showToast("Namaz & Ayah installed successfully 🌙");
  });
}

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  try {
    await navigator.serviceWorker.register("service-worker.js");
  } catch (error) {
    console.warn("Service worker registration failed", error);
  }
}

async function loadDailyAyah() {
  const ayah = await fetchRandomAyah();
  if (ayah) {
    renderAyah(ayah);
  }
}

async function loadRandomAyah(force = false) {
  setAyahLoading(true);
  const ayah = await fetchRandomAyah();
  if (ayah) {
    renderAyah(ayah);
    if (force) showToast("A new ayah is ready.");
  }
  setAyahLoading(false);
}

async function fetchRandomAyah() {
  setAyahLoading(true);
  const { surahNo, ayahNo, ref } = getFreshRandomAyahRef();
  try {
    const response = await fetch(`${QURAN_BASE}/${surahNo}/${ayahNo}.json`, { cache: "no-store" });
    if (!response.ok) throw new Error("Quran API request failed");
    const ayah = await response.json();
    const normalized = normalizeAyah(ayah);
    rememberAyahRef(ref);
    writeJSON(STORAGE.ayah, { date: new Date().toISOString(), ayah: normalized });
    setAyahLoading(false);
    return normalized;
  } catch (error) {
    console.warn(error);
    showToast("Using saved ayah while connection recovers.");
    setAyahLoading(false);
    return readJSON(STORAGE.ayah)?.ayah || fallbackAyah();
  }
}

function getFreshRandomAyahRef() {
  const recent = readJSON(STORAGE.recentAyahs) || [];
  let candidate = createRandomAyahRef();
  let attempts = 0;
  while (recent.includes(candidate.ref) && attempts < 40) {
    candidate = createRandomAyahRef();
    attempts += 1;
  }
  return candidate;
}

function createRandomAyahRef() {
  const surahNo = randomInt(1, 114);
  const ayahNo = randomInt(1, surahAyahCounts[surahNo - 1]);
  return { surahNo, ayahNo, ref: `${surahNo}:${ayahNo}` };
}

function rememberAyahRef(ref) {
  const recent = readJSON(STORAGE.recentAyahs) || [];
  writeJSON(STORAGE.recentAyahs, [ref, ...recent.filter((item) => item !== ref)].slice(0, 10));
}

function normalizeAyah(ayah) {
  return {
    surahName: ayah.surahName || "Surah",
    surahNameArabic: ayah.surahNameArabic || "",
    surahNameTranslation: ayah.surahNameTranslation || "",
    surahNo: ayah.surahNo,
    ayahNo: ayah.ayahNo,
    arabic: ayah.arabic1 || ayah.arabic2 || "",
    english: ayah.english || "",
    urdu: ayah.urdu || "",
    audioUrl: ayah.audio?.["1"]?.url || ayah.audio?.["1"]?.originalUrl || "",
    reciter: ayah.audio?.["1"]?.reciter || "Mishary Rashid Al Afasy"
  };
}

function renderAyah(ayah) {
  currentAyah = ayah;
  els.arabicText.textContent = ayah.arabic;
  els.translationText.textContent = ayah.english;
  els.romanText.textContent = `Roman English: ${transliterateAyah(ayah.arabic)}`;
  els.surahRef.textContent = `${ayah.surahName} ${ayah.surahNo}:${ayah.ayahNo}`;
  els.reciterName.textContent = ayah.reciter;
  els.ayahAudio.src = ayah.audioUrl || "";
  setAyahTab(activeAyahTab, false);
  setAyahLoading(false);
}

function setAyahLoading(isLoading) {
  els.ayahLoader.classList.toggle("active", isLoading);
  els.ayahContent.classList.toggle("loading", isLoading);
}

function setAyahTab(tab, animate = true) {
  if (!currentAyah) return;
  activeAyahTab = tab;
  const content = getAyahTabContent(tab);
  els.ayahTabs.forEach((button) => {
    const isActive = button.dataset.tab === tab;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });
  els.ayahTabPanel.className = `ayah-tab-panel ${content.mode}`;
  els.ayahTabPanel.setAttribute("aria-labelledby", content.labelledBy);
  els.ayahTabText.dir = content.dir;
  els.ayahTabText.textContent = content.text;
  if (animate) {
    els.ayahTabPanel.classList.remove("switching");
    void els.ayahTabPanel.offsetWidth;
    els.ayahTabPanel.classList.add("switching");
  }
}

function getAyahTabContent(tab) {
  const roman = transliterateAyah(currentAyah.arabic);
  const tabs = {
    arabic: {
      text: currentAyah.arabic,
      dir: "rtl",
      mode: "arabic-mode",
      labelledBy: "tabArabic"
    },
    roman: {
      text: roman,
      dir: "ltr",
      mode: "roman-mode",
      labelledBy: "tabRoman"
    },
    meaning: {
      text: currentAyah.english,
      dir: "ltr",
      mode: "meaning-mode",
      labelledBy: "tabMeaning"
    }
  };
  return tabs[tab] || tabs.arabic;
}

function loadSavedLocationOrDefault() {
  const saved = readJSON(STORAGE.location);
  if (saved?.latitude && saved?.longitude) {
    loadPrayerTimes(buildCoordinatePrayerUrl(saved.latitude, saved.longitude), saved.label || "Saved location");
    return;
  }
  loadPrayerTimes();
}

async function loadPrayerTimes(url = PRAYER_CITY_URL, label = "Mumbai, India") {
  renderPrayerSkeletons();
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error("Prayer API request failed");
    const json = await response.json();
    prayerData = json.data;
    els.locationLabel.textContent = label;
    els.hijriDate.textContent = formatHijri(json.data.date?.hijri);
    renderPrayerTimes(json.data.timings);
    updateNextPrayer(json.data.timings);
    scheduleNotificationTimers(json.data.timings);
  } catch (error) {
    console.warn(error);
    showToast("Prayer times are offline. Showing Mumbai fallback.");
    const fallback = { Fajr: "04:42", Dhuhr: "12:36", Asr: "15:56", Maghrib: "19:12", Isha: "20:30" };
    renderPrayerTimes(fallback);
    updateNextPrayer(fallback);
  }
}

function renderPrayerSkeletons() {
  els.prayerGrid.innerHTML = prayerNames.map(() => `<article class="prayer-card skeleton"><span></span><strong></strong><small></small></article>`).join("");
}

function renderPrayerTimes(timings) {
  els.prayerGrid.innerHTML = prayerNames.map((name) => {
    const cleanTime = cleanPrayerTime(timings[name]);
    return `
      <article class="prayer-card" data-prayer="${name}">
        <span>${displayPrayerNames[name] || name}</span>
        <strong>${formatTime(cleanTime)}</strong>
        <small>${name === "Fajr" ? "Start your day" : name === "Maghrib" ? "Sunset prayer" : "Reminder ready"}</small>
      </article>
    `;
  }).join("");
}

function updateNextPrayer(timings) {
  clearInterval(countdownTimer);
  const tick = () => {
    const next = getNextPrayer(timings);
    els.nextPrayerName.textContent = displayPrayerNames[next.name] || next.name;
    els.nextPrayerTime.textContent = formatTime(next.time);
    els.countdown.textContent = formatCountdown(next.date - new Date());
    document.querySelectorAll(".prayer-card").forEach((card) => {
      card.classList.toggle("active", card.dataset.prayer === next.name);
    });
  };
  tick();
  countdownTimer = setInterval(tick, 1000);
}

function getNextPrayer(timings) {
  const now = new Date();
  const today = prayerNames.map((name) => ({ name, time: cleanPrayerTime(timings[name]), date: timeToDate(cleanPrayerTime(timings[name])) }));
  return today.find((item) => item.date > now) || { ...today[0], date: addDays(today[0].date, 1) };
}

async function detectLocation() {
  if (!navigator.geolocation) {
    showToast("Location is not available on this browser.");
    return;
  }
  setLocationLoading(true);
  showToast("Finding your prayer location...");
  navigator.geolocation.getCurrentPosition(async (position) => {
    const { latitude, longitude } = position.coords;
    try {
      const label = await resolveLocationLabel(latitude, longitude);
      writeJSON(STORAGE.location, {
        latitude,
        longitude,
        label,
        savedAt: new Date().toISOString()
      });
      await loadPrayerTimes(buildCoordinatePrayerUrl(latitude, longitude), label);
      showToast("Location detected successfully 🌙");
    } catch (error) {
      console.warn(error);
      showToast("Could not load local timings. Showing Mumbai fallback.");
      await loadPrayerTimes();
    } finally {
      setLocationLoading(false);
    }
  }, async () => {
    setLocationLoading(false);
    localStorage.removeItem(STORAGE.location);
    showToast("Location permission denied. Showing Mumbai timings.");
    await loadPrayerTimes();
  }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 600000 });
}

function buildCoordinatePrayerUrl(latitude, longitude) {
  return `https://api.aladhan.com/v1/timings?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}&method=2`;
}

async function resolveLocationLabel(latitude, longitude) {
  try {
    const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}&localityLanguage=en`, { cache: "no-store" });
    if (!response.ok) throw new Error("Reverse geocode failed");
    const data = await response.json();
    const city = data.city || data.locality || data.principalSubdivision || "Current location";
    const country = data.countryName || data.countryCode || "";
    return [city, country].filter(Boolean).join(", ");
  } catch (error) {
    console.warn(error);
    return `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
  }
}

function setLocationLoading(isLoading) {
  els.detectLocationBtn.classList.toggle("is-loading", isLoading);
  els.detectLocationBtn.disabled = isLoading;
  els.detectLocationBtn.textContent = isLoading ? "Detecting" : "Use Location";
}

async function enableNotifications() {
  closePermissionModal();
  if (!("Notification" in window)) {
    showToast("Notifications are not supported here.");
    return;
  }

  const permission = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
  localStorage.setItem(STORAGE.notificationAsked, "true");

  if (permission !== "granted") {
    showToast("Notification permission was not enabled.");
    return;
  }

  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(async (OneSignal) => {
    try {
      await OneSignal.User.PushSubscription.optIn();
    } catch (error) {
      console.warn("OneSignal opt-in skipped", error);
    }
  });

  saveNotificationSettings();
  if (prayerData?.timings) scheduleNotificationTimers(prayerData.timings);
  showLocalNotification("Namaz & Ayah", "Reminders are enabled for prayer times and daily ayahs.");
  showToast("Reminders enabled.");
}

function scheduleNotificationTimers(timings) {
  notificationTimers.forEach(clearTimeout);
  notificationTimers = [];
  if (Notification.permission !== "granted") return;
  const settings = getNotificationSettings();

  if (settings.prayers) {
    prayerNames.forEach((name) => {
      const date = timeToDate(cleanPrayerTime(timings[name]));
      if (date <= new Date()) date.setDate(date.getDate() + 1);
      const delay = date - new Date();
      notificationTimers.push(setTimeout(() => {
        showLocalNotification(`${displayPrayerNames[name] || name} time`, "It is time for prayer. May Allah accept your salah.");
      }, delay));
    });
  }

  if (settings.ayah) {
    const ayahDate = new Date();
    ayahDate.setHours(9, 0, 0, 0);
    if (ayahDate <= new Date()) ayahDate.setDate(ayahDate.getDate() + 1);
    notificationTimers.push(setTimeout(() => {
      showLocalNotification("Daily Quran Ayah", currentAyah?.english || "Open Namaz & Ayah for today's reflection.");
    }, ayahDate - new Date()));
  }
}

async function showLocalNotification(title, body) {
  if (!("serviceWorker" in navigator)) {
    new Notification(title, { body });
    return;
  }
  const registration = await navigator.serviceWorker.ready;
  registration.showNotification(title, {
    body,
    icon: iconDataUri(),
    badge: iconDataUri(),
    tag: title.toLowerCase().replaceAll(" ", "-"),
    data: { url: location.href }
  });
}

function saveNotificationSettings() {
  writeJSON(STORAGE.settings, {
    prayers: els.prayerAlertsToggle.checked,
    ayah: els.ayahAlertsToggle.checked
  });
  if (prayerData?.timings) scheduleNotificationTimers(prayerData.timings);
}

function getNotificationSettings() {
  return readJSON(STORAGE.settings) || { prayers: true, ayah: true };
}

function initInstallExperience() {
  updateInstallButtons();
  scheduleInstallPopup();
}

function updateInstallButtons() {
  const installed = isAppInstalled();
  els.installButtons.forEach((button) => {
    button.hidden = installed;
    button.setAttribute("aria-hidden", String(installed));
  });
  if (els.installBtn) {
    els.installBtn.hidden = installed || (!deferredInstallPrompt && !isIOS());
  }
}

function scheduleInstallPopup() {
  clearTimeout(scheduleInstallPopup.timer);
  if (!shouldShowInstallPopup()) return;
  scheduleInstallPopup.timer = setTimeout(() => {
    if (shouldShowInstallPopup() && els.permissionModal.hidden) openInstallModal(false);
  }, 5000);
}

function shouldShowInstallPopup() {
  if (isAppInstalled()) return false;
  if (!deferredInstallPrompt && !isIOS()) return false;
  const dismissedAt = Number(localStorage.getItem(STORAGE.installDismissed) || 0);
  return !dismissedAt || Date.now() - dismissedAt > 24 * 60 * 60 * 1000;
}

function openInstallModal(manual = false) {
  if (isAppInstalled()) {
    showToast("Namaz & Ayah is already installed.");
    return;
  }
  if (!manual && !shouldShowInstallPopup()) return;
  const ios = isIOS();
  els.iosInstallSteps.hidden = !ios;
  els.installNowBtn.textContent = ios ? "Show Instructions" : "Install Now";
  els.installDescription.textContent = "Get daily Quran ayahs, prayer reminders, and Islamic notifications directly on your home screen.";
  els.installModal.hidden = false;
  document.body.classList.add("modal-open");
}

function dismissInstallModal() {
  localStorage.setItem(STORAGE.installDismissed, String(Date.now()));
  closeInstallModal(true);
}

function closeInstallModal(keepDismissed = true) {
  els.installModal.hidden = true;
  if (!keepDismissed) localStorage.removeItem(STORAGE.installDismissed);
  if (els.permissionModal.hidden) document.body.classList.remove("modal-open");
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function isAppInstalled() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function maybeShowNotificationPopup() {
  const asked = localStorage.getItem(STORAGE.notificationAsked);
  if (!asked && "Notification" in window && Notification.permission === "default") {
    setTimeout(() => {
      els.permissionModal.hidden = false;
      document.body.classList.add("modal-open");
    }, 1600);
  }
}

function closePermissionModal() {
  els.permissionModal.hidden = true;
  if (els.installModal.hidden) document.body.classList.remove("modal-open");
  scheduleInstallPopup();
}

function playAyahAudio() {
  if (!currentAyah?.audioUrl) {
    showToast("Audio is not available for this ayah.");
    return;
  }
  if (els.ayahAudio.paused) {
    els.ayahAudio.play().then(() => showToast("Recitation started.")).catch(() => showToast("Tap again to play audio."));
  } else {
    els.ayahAudio.pause();
    showToast("Recitation paused.");
  }
}

async function copyCurrentAyah() {
  if (!currentAyah) return;
  await navigator.clipboard.writeText(formatAyahShareText(currentAyah));
  showToast("Ayah copied.");
}

async function shareCurrentAyah() {
  if (!currentAyah) return;
  const shareData = {
    title: "Namaz & Ayah",
    text: formatAyahShareText(currentAyah),
    url: location.href
  };
  if (navigator.share) {
    await navigator.share(shareData).catch(() => {});
  } else {
    await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
    showToast("Share text copied.");
  }
}

function saveCurrentAyah() {
  if (!currentAyah) return;
  const favorites = readJSON(STORAGE.favorites) || [];
  const id = `${currentAyah.surahNo}:${currentAyah.ayahNo}`;
  if (favorites.some((item) => item.id === id)) {
    showToast("This ayah is already saved.");
    return;
  }
  favorites.unshift({ id, ...currentAyah, savedAt: new Date().toISOString() });
  writeJSON(STORAGE.favorites, favorites.slice(0, 50));
  renderFavorites();
  showToast("Ayah saved.");
}

function renderFavorites() {
  const favorites = readJSON(STORAGE.favorites) || [];
  els.favoriteCount.textContent = favorites.length;
  if (!favorites.length) {
    els.favoritesList.innerHTML = `<div class="empty-state">Saved ayahs will appear here.</div>`;
    return;
  }
  els.favoritesList.innerHTML = favorites.map((item) => `
    <article class="favorite-item">
      <strong>${item.surahName} ${item.surahNo}:${item.ayahNo}</strong>
      <p dir="rtl" class="arabic-mini">${item.arabic}</p>
      <p>${item.english}</p>
    </article>
  `).join("");
}

function clearFavorites() {
  localStorage.removeItem(STORAGE.favorites);
  renderFavorites();
  showToast("Favorites cleared.");
}

function restoreTasbeeh() {
  els.tasbeehCount.textContent = localStorage.getItem(STORAGE.tasbeeh) || "0";
  setDhikr(localStorage.getItem(STORAGE.dhikr) || "SubhanAllah", false);
}

function incrementTasbeeh() {
  const count = Number(els.tasbeehCount.textContent) + 1;
  els.tasbeehCount.textContent = count;
  localStorage.setItem(STORAGE.tasbeeh, String(count));
  els.tasbeehBtn.classList.remove("pop");
  void els.tasbeehBtn.offsetWidth;
  els.tasbeehBtn.classList.add("pop");
  if ([33, 66, 99, 100].includes(count)) showToast(`${count} ${els.currentDhikr.textContent}`);
}

function resetTasbeeh() {
  els.tasbeehCount.textContent = "0";
  localStorage.setItem(STORAGE.tasbeeh, "0");
  showToast("Tasbeeh reset.");
}

function setDhikr(dhikr, shouldToast = true) {
  els.currentDhikr.textContent = dhikr;
  localStorage.setItem(STORAGE.dhikr, dhikr);
  els.presetButtons.forEach((button) => button.classList.toggle("active", button.dataset.dhikr === dhikr));
  if (shouldToast) showToast(`${dhikr} selected.`);
}

function rotateQuote() {
  renderRandomQuote(false);
  clearInterval(quoteTimer);
  quoteTimer = setInterval(() => renderRandomQuote(true), 180000);
}

function renderRandomQuote(animate = true) {
  const quote = getFreshQuote();
  const applyQuote = () => {
    els.quoteText.textContent = `“${quote.text}”`;
    els.quoteSource.textContent = quote.source;
    els.quoteText.classList.remove("quote-changing");
    els.quoteSource.classList.remove("quote-changing");
    void els.quoteText.offsetWidth;
    els.quoteText.classList.add("quote-visible");
    els.quoteSource.classList.add("quote-visible");
  };

  if (!animate) {
    applyQuote();
    return;
  }

  els.quoteText.classList.add("quote-changing");
  els.quoteSource.classList.add("quote-changing");
  setTimeout(applyQuote, 260);
}

function getFreshQuote() {
  const history = readJSON(STORAGE.quoteHistory) || [];
  const available = quotes
    .map(([text, source], index) => ({ text, source, index }))
    .filter((quote) => !history.includes(quote.index));
  const pool = available.length ? available : quotes.map(([text, source], index) => ({ text, source, index }));
  const quote = pool[randomInt(0, pool.length - 1)];
  writeJSON(STORAGE.quoteHistory, [quote.index, ...history.filter((item) => item !== quote.index)].slice(0, 10));
  return quote;
}

function initRevealAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".section-reveal").forEach((el) => observer.observe(el));
}

function initParticles() {
  const canvas = document.getElementById("particles");
  const ctx = canvas.getContext("2d");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let particles = [];
  const resize = () => {
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = innerWidth * ratio;
    canvas.height = innerHeight * ratio;
    canvas.style.width = `${innerWidth}px`;
    canvas.style.height = `${innerHeight}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    particles = Array.from({ length: Math.min(78, Math.floor(innerWidth / 12)) }, () => ({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      r: Math.random() * 1.8 + .35,
      vx: (Math.random() - .5) * .16,
      vy: Math.random() * .18 + .05,
      a: Math.random() * .48 + .18
    }));
  };
  const draw = () => {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    particles.forEach((p) => {
      p.x += p.vx;
      p.y -= p.vy;
      if (p.y < -10) p.y = innerHeight + 10;
      if (p.x < -10) p.x = innerWidth + 10;
      if (p.x > innerWidth + 10) p.x = -10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(224, 197, 143, ${p.a})`;
      ctx.fill();
    });
    if (!reduceMotion) requestAnimationFrame(draw);
  };
  addEventListener("resize", resize);
  resize();
  draw();
}

function toggleNav() {
  const open = !els.navLinks.classList.contains("open");
  els.navLinks.classList.toggle("open", open);
  els.navToggle.setAttribute("aria-expanded", String(open));
  document.body.classList.toggle("menu-open", open);
}

function closeNav() {
  els.navLinks.classList.remove("open");
  els.navToggle.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");
}

async function installApp() {
  if (isIOS()) {
    els.iosInstallSteps.hidden = false;
    els.installNowBtn.textContent = "Instructions Shown";
    showToast("Open Safari → Tap Share → Add to Home Screen");
    return;
  }
  if (!deferredInstallPrompt) {
    showToast("Install prompt will appear when your browser allows it.");
    return;
  }
  deferredInstallPrompt.prompt();
  const choice = await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  updateInstallButtons();
  if (choice.outcome === "accepted") {
    closeInstallModal(false);
    showToast("Namaz & Ayah installed successfully 🌙");
  } else {
    dismissInstallModal();
  }
}

function updateNetworkState() {
  els.onlineState.textContent = navigator.onLine ? "Online" : "Offline";
}

function cleanPrayerTime(value = "00:00") {
  return value.split(" ")[0].trim();
}

function formatTime(value) {
  const [hour, minute] = value.split(":").map(Number);
  return new Intl.DateTimeFormat([], { hour: "numeric", minute: "2-digit" }).format(new Date(2000, 0, 1, hour, minute));
}

function timeToDate(value) {
  const [hour, minute] = value.split(":").map(Number);
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatCountdown(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return `${hours}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
}

function formatHijri(hijri) {
  if (!hijri) return "Hijri date";
  return `${hijri.day} ${hijri.month?.en || ""} ${hijri.year} AH`;
}

function formatAyahShareText(ayah) {
  return `${ayah.arabic}\n\n${ayah.english}\n\n${ayah.surahName} ${ayah.surahNo}:${ayah.ayahNo}`;
}

function transliterateAyah(text = "") {
  const normalized = text.normalize("NFC").replace(/[ۖۗۘۙۚۛۜ۞ۣ۟۠ۡۢۤۥۦۧۨ۩ـ]/g, "");
  const plain = normalized
    .replace(/[ًٌٍَُِّْٰ]/g, "")
    .replace(/[ٱأإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/\s+/g, " ")
    .trim();
  const exact = {
    "بسم الله الرحمن الرحيم": "Bismillahir Rahmanir Raheem",
    "الحمد لله رب العالمين": "Alhamdulillahi Rabbil Aalameen",
    "الرحمن الرحيم": "Ar Rahmanir Raheem",
    "مالك يوم الدين": "Maaliki Yawmid Deen",
    "اياك نعبد واياك نستعين": "Iyyaka Na'budu Wa Iyyaka Nasta'een",
    "اهدنا الصراط المستقيم": "Ihdinas Siratal Mustaqeem",
    "صراط الذين انعمت عليهم غير المغضوب عليهم ولا الضالين": "Siratal Lazeena An'amta Alaihim Ghairil Maghdoobi Alaihim Wa Lad Dalleen",
    "قل هو الله احد": "Qul Huwallahu Ahad",
    "الله الصمد": "Allahus Samad",
    "لم يلد ولم يولد": "Lam Yalid Wa Lam Yoolad",
    "ولم يكن له كفوا احد": "Wa Lam Yakullahu Kufuwan Ahad"
  };
  if (exact[plain]) return exact[plain];
  if (/بِسْمِ\s+ٱ?للَّهِ\s+ٱ?لرَّحْمَٰنِ\s+ٱ?لرَّحِيمِ/.test(normalized)) {
    return "Bismillahir Rahmanir Raheem";
  }

  const letters = {
    "ا": "a", "أ": "a", "إ": "i", "آ": "aa", "ٱ": "a", "ب": "b", "ت": "t", "ث": "th", "ج": "j",
    "ح": "h", "خ": "kh", "د": "d", "ذ": "dh", "ر": "r", "ز": "z", "س": "s", "ش": "sh", "ص": "s",
    "ض": "d", "ط": "t", "ظ": "z", "ع": "'", "غ": "gh", "ف": "f", "ق": "q", "ك": "k", "ل": "l",
    "م": "m", "ن": "n", "ه": "h", "ة": "h", "و": "w", "ؤ": "u", "ي": "y", "ى": "a", "ئ": "i", "ء": "'"
  };
  const vowels = { "َ": "a", "ُ": "u", "ِ": "i", "ً": "an", "ٌ": "un", "ٍ": "in", "ْ": "", "ّ": "", "ٰ": "a" };
  let output = "";
  let previousLetter = "";

  [...normalized].forEach((char, index, chars) => {
    if (/\s/.test(char)) {
      output += " ";
      previousLetter = "";
      return;
    }
    if (char === "ّ") {
      output += previousLetter;
      return;
    }
    if (vowels[char] !== undefined) {
      output += vowels[char];
      return;
    }
    if (char === "و" && chars[index - 1] === "ُ") {
      output += "o";
      previousLetter = "";
      return;
    }
    if (char === "ي" && chars[index - 1] === "ِ") {
      output += "ee";
      previousLetter = "";
      return;
    }
    const value = letters[char] || "";
    output += value;
    previousLetter = value;
  });

  return tidyTransliteration(output);
}

function tidyTransliteration(value) {
  return value
    .replace(/\bEenanmaa\b/gi, "Innama")
    .replace(/\bAl-Lalhi\b/gi, "Allahi")
    .replace(/\bAl-Lalhu\b/gi, "Allahu")
    .replace(/\bAl-Lalha\b/gi, "Allaha")
    .replace(/\bAl-Llahu\b/gi, "Allahu")
    .replace(/\bAl-Llahi\b/gi, "Allahi")
    .replace(/\bNurieedu\b/gi, "Nureedu")
    .replace(/\bShukuorana\b/gi, "Shukooran")
    .replace(/\bqul huwa allahu ahadun\b/gi, "Qul Huwallahu Ahad")
    .replace(/\ballahu alssamadu\b/gi, "Allahus Samad")
    .replace(/\blam yalid walam yooladu\b/gi, "Lam Yalid Wa Lam Yoolad")
    .replace(/\bwalam yakun lahu kufuwan ahadun\b/gi, "Wa Lam Yakullahu Kufuwan Ahad")
    .replace(/\balhamdu lillahi rabbi al'aalameena\b/gi, "Alhamdulillahi Rabbil Aalameen")
    .replace(/\barrahmani arraheemi\b/gi, "Ar Rahmanir Raheem")
    .replace(/\bmaaliki yawmi alddeeni\b/gi, "Maaliki Yawmid Deen")
    .replace(/\ba\s+llahi\b/gi, "Allahi")
    .replace(/\ba\s+llahu\b/gi, "Allahu")
    .replace(/\ballahu al/gi, "Allahul ")
    .replace(/\ballahi\s+alr/gi, "Allahir R")
    .replace(/\balr/gi, "ar-r")
    .replace(/\bal([tdszrlmn])/gi, "al-$1")
    .replace(/\bwa\s+lam\b/gi, "wa lam")
    .replace(/\bwala\b/gi, "wa la")
    .replace(/\byooladu\b/gi, "yoolad")
    .replace(/\bahadun\b/gi, "ahad")
    .replace(/\bassamadu\b/gi, "samad")
    .replace(/'uo/gi, "'oo")
    .replace(/uona\b/gi, "oona")
    .replace(/aona\b/gi, "oon")
    .replace(/aa+/g, "aa")
    .replace(/ii+/g, "ee")
    .replace(/uu+/g, "oo")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .replace(/'([A-Z])/g, (_, letter) => `'${letter.toLowerCase()}`) || "Transliteration loading";
}

function toHinglish(text = "", urdu = "") {
  const clean = normalizeMeaningText(text);
  if (!clean) return "Is ayah ka paigham dil se samajhne aur amal karne ke liye hai.";

  const romanUrdu = romanizeUrduMeaning(urdu);
  if (romanUrdu.quality >= 0.64) return romanUrdu.text;

  const direct = matchHinglishPattern(clean);
  if (direct) return direct;

  const clauses = clean
    .split(/([,;:.!?])/)
    .reduce((parts, piece, index, source) => {
      if (/^[,;:.!?]$/.test(piece) && parts.length) {
        parts[parts.length - 1] += piece;
      } else if (piece.trim()) {
        parts.push(piece.trim() + (/^[,;:.!?]$/.test(source[index + 1] || "") ? "" : ""));
      }
      return parts;
    }, []);

  const translated = clauses
    .map((clause) => translateHinglishClause(clause))
    .join(" ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

  return polishHinglish(translated || `Is ayah ka paigham: ${clean}`);
}

function normalizeMeaningText(text = "") {
  return text
    .replace(/[“”‘’]/g, "")
    .replace(/[˹˺]/g, "")
    .replace(/[—–]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function romanizeUrduMeaning(urdu = "") {
  const clean = urdu
    .replace(/[()（）]/g, " ")
    .replace(/[،؛؟۔]/g, ". ")
    .replace(/[ًٌٍَُِّْٰـ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!clean || !/[\u0600-\u06ff]/.test(clean)) return { text: "", quality: 0 };

  const words = {
    "اللہ": "Allah", "اللّہ": "Allah", "خدا": "Allah", "رب": "Rabb", "پروردگار": "Rabb",
    "رحمن": "Rehman", "رحیم": "Raheem", "مہربان": "Meherban", "بخشنے": "maaf karne", "بخشنےوالا": "maaf karne wala",
    "موسی": "Musa", "موسٰی": "Musa", "عیسی": "Isa", "ابراہیم": "Ibrahim", "نوح": "Nooh", "محمد": "Muhammad",
    "کہا": "ne kaha", "کہتے": "kehte", "کہو": "keh do", "فرمایا": "farmaya", "بولا": "bola",
    "وہ": "woh", "یہ": "yeh", "کیا": "kya", "جو": "jo", "جن": "jin", "جس": "jis", "جسے": "jise", "جسکو": "jisko",
    "لوگ": "log", "شخص": "shakhs", "مومن": "momin", "ایمان": "imaan", "یقین": "yaqeen", "یقین رکھتے": "yaqeen rakhte",
    "آسمان": "aasman", "آسمانوں": "aasmano", "زمین": "zameen", "درمیان": "darmiyan", "دنیا": "duniya",
    "زندگی": "zindagi", "آخرت": "aakhirat", "قیامت": "qayamat", "دن": "din", "رات": "raat",
    "نماز": "namaz", "صلوۃ": "namaz", "زکوۃ": "zakat", "زکوة": "zakat", "صدقہ": "sadaqah",
    "صبر": "sabr", "صابر": "sabr karne wale", "شکر": "shukar", "رحمت": "rehmat", "نور": "noor",
    "ہدایت": "hidayat", "راستہ": "raasta", "راستے": "raaste", "سیدھا": "seedha", "سیدھے": "seedhe",
    "نشانیاں": "nishaniyan", "نشانیوں": "nishaniyon", "کتاب": "kitab", "حق": "haq", "باطل": "batil",
    "آگ": "aag", "دوزخ": "jahannam", "جہنم": "jahannam", "جنت": "jannat", "باغ": "baagh", "اجر": "ajr",
    "عذاب": "azaab", "گناہ": "gunah", "برائی": "burai", "بےحیائی": "behayai", "بے حیائی": "behayai",
    "حاکم": "haakim", "حاکموں": "haakimon", "انصاف": "insaf", "عادل": "insaf karne wala",
    "مسکین": "gareeb", "مسکینوں": "gareebo", "غریب": "gareeb", "غریبوں": "gareebo", "کھانا": "khana",
    "کھلانے": "khilane", "ترغیب": "targheeb", "نہیں": "nahi", "نہ": "nahi", "مت": "mat",
    "اور": "aur", "یا": "ya", "اگر": "agar", "پھر": "phir", "لیکن": "lekin", "بلکہ": "balke",
    "میں": "mein", "سے": "se", "کو": "ko", "کا": "ka", "کی": "ki", "کے": "ke", "پر": "par", "تک": "tak",
    "ساتھ": "saath", "لئے": "liye", "لیے": "liye", "لیئے": "liye", "واسطے": "liye",
    "ہے": "hai", "ہیں": "hain", "تھا": "tha", "تھے": "the", "ہو": "ho", "ہوں": "hun", "ہوگا": "hoga",
    "سب": "sab", "تمام": "tamam", "ہر": "har", "کچھ": "kuch", "چیز": "cheez", "بیشک": "Beshak", "بےشک": "Beshak",
    "بڑا": "bada", "بڑی": "badi", "بہت": "bahut", "نہایت": "nihayat", "خوش": "khush", "راضی": "raazi",
    "غافل": "ghafil", "اطمینان": "itminan", "مطمئن": "mutmain", "امید": "umeed", "ملاقات": "mulaqat",
    "فرشتے": "farishte", "فرشتہ": "farishta", "رسول": "rasool", "رسولوں": "rasoolon", "پیغمبر": "paighambar",
    "نگہبان": "nigran", "نگران": "nigran", "مقرر": "muqarrar", "آگے": "aage", "پیچھے": "peeche",
    "پسند": "pasand", "چاہتا": "chahta", "چاہتے": "chahte", "دیتا": "deta", "دیتے": "dete", "دے": "de",
    "روکتی": "rokti", "منع": "mana", "کرتا": "karta", "کرتے": "karte", "کرتی": "karti", "رکھتے": "rakhte",
    "رکھتا": "rakhta", "رکھتی": "rakhti", "والا": "wala", "والے": "wale", "والی": "wali"
  };

  const charMap = {
    "ا": "a", "آ": "aa", "أ": "a", "إ": "i", "ب": "b", "پ": "p", "ت": "t", "ٹ": "t", "ث": "s",
    "ج": "j", "چ": "ch", "ح": "h", "خ": "kh", "د": "d", "ڈ": "d", "ذ": "z", "ر": "r", "ڑ": "r",
    "ز": "z", "ژ": "zh", "س": "s", "ش": "sh", "ص": "s", "ض": "z", "ط": "t", "ظ": "z", "ع": "",
    "غ": "gh", "ف": "f", "ق": "q", "ک": "k", "ك": "k", "گ": "g", "ل": "l", "م": "m", "ن": "n",
    "ں": "n", "و": "o", "ؤ": "o", "ہ": "h", "ھ": "h", "ء": "", "ی": "i", "ئ": "i", "ے": "e", "ۂ": "h"
  };

  let known = 0;
  let total = 0;
  const text = clean.split(/\s+/).map((token) => {
    const punctuation = token.match(/[.!,;:?]+$/)?.[0] || "";
    const bare = token.replace(/[.!,;:?]+$/g, "");
    if (!bare) return punctuation;
    total += 1;
    if (words[bare]) {
      known += 1;
      return words[bare] + punctuation;
    }
    const roman = [...bare].map((char) => charMap[char] ?? "").join("").replace(/aa+/g, "aa").replace(/\s+/g, " ").trim();
    return roman ? roman + punctuation : "";
  }).join(" ");

  const polished = polishRomanUrdu(text);
  const quality = total ? known / total : 0;
  return { text: polished, quality };
}

function polishRomanUrdu(text = "") {
  return text
    .replace(/\bAllah hi ko\b/gi, "Allah hi ke liye")
    .replace(/\bRabb hai ka\b/gi, "ka Rabb hai")
    .replace(/\bka Rabb hai aasmano aur zameen\b/gi, "aasmano aur zameen ka Rabb hai")
    .replace(/\baasmano ka aur zameen ka Rabb\b/gi, "aasmano aur zameen ka Rabb")
    .replace(/\bkhana khilane targheeb nahi\b/gi, "khana khilane ki targheeb nahi")
    .replace(/\bke saath hai\b/gi, "ke saath hai")
    .replace(/\s+([.!,;:?])/g, "$1")
    .replace(/\.{2,}/g, ".")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());
}

function matchHinglishPattern(text) {
  const patterns = [
    {
      re: /^(?:and\s+)?(?:they\s+)?(?:do not\s+)?urge one another to feed (?:the )?poor\.?$/i,
      out: "Aur tum ek dusre ko gareebo ko khana khilane ki targheeb nahi dete."
    },
    {
      re: /^(?:this|the) worldly life\.?$/i,
      out: "Yeh duniya ki zindagi hai."
    },
    {
      re: /^they are content with (?:the )?(?:worldly|this worldly) life\.?$/i,
      out: "Woh log duniya ki zindagi mein hi khush hain."
    },
    {
      re: /^those who are content with (?:the )?(?:worldly|this worldly) life\.?$/i,
      out: "Jo log duniya ki zindagi mein hi khush hain."
    },
    {
      re: /^(?:he|it) is (?:the )?lord of (?:the )?heavens and (?:the )?earth(?: and whatever is between them)?(?:,? if you (?:had )?(?:sure )?faith)?\.?$/i,
      out: "Woh aasmano aur zameen ka Rabb hai aur jo kuch unke darmiyan hai sab usi ka hai, agar tum yaqeen rakhte ho."
    },
    {
      re: /^moses said:?\s*(?:he|it) is (?:the )?lord of (?:the )?heavens and (?:the )?earth(?: and whatever is between them)?(?:,? if you (?:had )?(?:sure )?faith)?\.?$/i,
      out: "Musa ne kaha: Woh aasmano aur zameen ka Rabb hai aur jo kuch unke darmiyan hai sab usi ka hai, agar tum yaqeen rakhte ho."
    },
    {
      re: /^indeed,?\s*allah is with the patient\.?$/i,
      out: "Beshak Allah sabr karne walon ke saath hai."
    },
    {
      re: /^indeed,?\s*allah is with those who are patient\.?$/i,
      out: "Beshak Allah sabr karne walon ke saath hai."
    },
    {
      re: /^indeed,?\s*prayer (?:prohibits|forbids|restrains) immorality and wrongdoing\.?$/i,
      out: "Beshak namaz behayai aur burai se rokti hai."
    },
    {
      re: /^guide us (?:along|to) the straight path\.?$/i,
      out: "Humein seedhe raaste ki hidayat de."
    },
    {
      re: /^in the name of allah,? the most compassionate,? most merciful\.?$/i,
      out: "Allah ke naam se shuru, jo nihayat Meherban aur bahut Reham karne wala hai."
    },
    {
      re: /^all praise is for allah.? lord of all worlds\.?$/i,
      out: "Saari tareef Allah ke liye hai, jo tamam jahano ka Rabb hai."
    },
    {
      re: /^is allah not the most just of all judges\??$/i,
      out: "Kya Allah sab faisla karne walon se behtar faisla karne wala nahi hai?"
    },
    {
      re: /^and your lord(?: o prophet)? would never destroy a society unjustly while its people were acting rightly\.?$/i,
      out: "Aur tumhara Rabb kisi basti ko zulm ke saath halaak nahi karta jab uske log islah karne wale hon."
    }
  ];
  return patterns.find((item) => item.re.test(text))?.out || "";
}

function translateHinglishClause(clause) {
  const mark = clause.match(/[,:;.!?]$/)?.[0] || "";
  const bare = clause.replace(/[,:;.!?]$/, "").trim();
  const lower = bare.toLowerCase();

  const clausePatterns = [
    [/^moses said$/i, "Musa ne kaha"],
    [/^he said$/i, "Usne kaha"],
    [/^they said$/i, "Unhone kaha"],
    [/^say$/i, "Keh do"],
    [/^indeed allah$/i, "Beshak Allah"],
    [/^indeed$/i, "Beshak"],
    [/^allah is with the patient$/i, "Allah sabr karne walon ke saath hai"],
    [/^allah is with those who are patient$/i, "Allah sabr karne walon ke saath hai"],
    [/^those who believe$/i, "Jo log Allah par imaan rakhte hain"],
    [/^those who do not expect to meet us$/i, "Jo log humse milne ki umeed nahi rakhte"],
    [/^and are pleased with the life of this world$/i, "aur duniya ki zindagi par hi khush hain"],
    [/^and feel secure in it$/i, "aur usi mein mutmain hain"],
    [/^and are heedless of our signs$/i, "aur hamari nishaniyon se ghafil hain"],
    [/^and do not urge one another to feed the poor$/i, "aur ek dusre ko gareebo ko khana khilane ki targheeb nahi dete"],
    [/^do not urge one another to feed the poor$/i, "Ek dusre ko gareebo ko khana khilane ki targheeb nahi dete"],
    [/^urge one another to feed the poor$/i, "Ek dusre ko gareebo ko khana khilane ki targheeb dete hain"],
    [/^and refuse to give even the simplest aid$/i, "aur sabse choti madad dene se bhi inkar karte hain"],
    [/^refuse to give even the simplest aid$/i, "Sabse choti madad dene se bhi inkar karte hain"],
    [/^except messengers of his choice$/i, "Siwaye un rasoolon ke jinhein woh pasand karta hai"],
    [/^except the messengers of his choice$/i, "Siwaye un rasoolon ke jinhein woh pasand karta hai"],
    [/^then he appoints angel guards before and behind them$/i, "Phir woh unke aage aur peeche farishte nigran muqarrar karta hai"],
    [/^then he appoints angel-guards before and behind them$/i, "Phir woh unke aage aur peeche farishte nigran muqarrar karta hai"],
    [/^he appoints angel guards before and behind them$/i, "Woh unke aage aur peeche farishte nigran muqarrar karta hai"],
    [/^he appoints angel-guards before and behind them$/i, "Woh unke aage aur peeche farishte nigran muqarrar karta hai"],
    [/^and whatever is between them$/i, "aur jo kuch unke darmiyan hai"],
    [/^whatever is between them$/i, "Jo kuch unke darmiyan hai"],
    [/^if you had sure faith$/i, "agar tum yaqeen rakhte ho"],
    [/^if you have sure faith$/i, "agar tum yaqeen rakhte ho"],
    [/^if you are believers$/i, "agar tum imaan wale ho"],
    [/^lord of the heavens and earth$/i, "aasmano aur zameen ka Rabb"],
    [/^the lord of the heavens and earth$/i, "aasmano aur zameen ka Rabb"],
    [/^lord of the heavens and the earth$/i, "aasmano aur zameen ka Rabb"],
    [/^he is lord of the heavens and earth$/i, "Woh aasmano aur zameen ka Rabb hai"],
    [/^he is the lord of the heavens and earth$/i, "Woh aasmano aur zameen ka Rabb hai"],
    [/^he is lord of the heavens and the earth$/i, "Woh aasmano aur zameen ka Rabb hai"],
    [/^he is the lord of the heavens and the earth$/i, "Woh aasmano aur zameen ka Rabb hai"]
  ];

  const exact = clausePatterns.find(([pattern]) => pattern.test(bare));
  if (exact) return exact[1] + mark;

  if (/^indeed\b/i.test(bare)) {
    return "Beshak " + translateHinglishClause(bare.replace(/^indeed,?\s*/i, "")).replace(/^./, (char) => char.toLowerCase()) + mark;
  }

  if (/^and\b/i.test(bare)) {
    return "aur " + translateHinglishClause(bare.replace(/^and\s+/i, "")).replace(/^./, (char) => char.toLowerCase()) + mark;
  }

  if (/^those who\b/i.test(bare)) {
    return "Jo log " + translateHinglishClause(bare.replace(/^those who\s+/i, "")).replace(/^./, (char) => char.toLowerCase()) + mark;
  }

  let translated = applyHinglishDictionary(lower);
  translated = fixHinglishGrammar(translated);
  return translated + mark;
}

function applyHinglishDictionary(text) {
  const phraseMap = [
    ["do not expect to meet us", "humse milne ki umeed nahi rakhte"],
    ["expect to meet us", "humse milne ki umeed rakhte"],
    ["life of this world", "duniya ki zindagi"],
    ["the life of this world", "duniya ki zindagi"],
    ["this worldly life", "duniya ki zindagi"],
    ["worldly life", "duniya ki zindagi"],
    ["this world", "yeh duniya"],
    ["heavens and earth", "aasmano aur zameen"],
    ["heavens and the earth", "aasmano aur zameen"],
    ["the heavens and the earth", "aasmano aur zameen"],
    ["between them", "unke darmiyan"],
    ["our signs", "hamari nishaniyan"],
    ["your lord", "tumhara Rabb"],
    ["their lord", "unka Rabb"],
    ["my lord", "mera Rabb"],
    ["lord of", "Rabb"],
    ["most compassionate", "nihayat Meherban"],
    ["most merciful", "bahut Reham karne wala"],
    ["straight path", "seedha raasta"],
    ["good deeds", "nek amal"],
    ["establish prayer", "namaz qayam karte hain"],
    ["give charity", "zakat dete hain"],
    ["urge one another to feed the poor", "ek dusre ko gareebo ko khana khilane ki targheeb dete hain"],
    ["feed the poor", "gareebo ko khana khilana"],
    ["patient ones", "sabr karne wale"],
    ["sure faith", "pukka yaqeen"],
    ["all worlds", "tamam jahaan"],
    ["all praise", "saari tareef"],
    ["messengers of his choice", "un rasoolon ke jinhein woh pasand karta hai"],
    ["angel guards", "farishte nigran"],
    ["angel-guards", "farishte nigran"],
    ["before and behind them", "unke aage aur peeche"]
  ];
  const wordMap = {
    allah: "Allah", god: "Allah", lord: "Rabb", rabb: "Rabb", mercy: "rahmat", merciful: "Reham karne wala",
    compassionate: "Meherban", guide: "hidayat de", guided: "hidayat yafta", path: "raasta", straight: "seedha",
    worlds: "jahaan", world: "duniya", heavens: "aasman", heaven: "aasman", earth: "zameen", between: "darmiyan",
    whatever: "jo kuch", everything: "har cheez", anything: "kuch bhi", believe: "imaan rakhte hain",
    believers: "imaan wale", faith: "yaqeen", patient: "sabr karne wale", patience: "sabr", prayer: "namaz",
    prayers: "namaz", charity: "zakat", signs: "nishaniyan", sign: "nishani", heedless: "ghafil",
    pleased: "khush", secure: "mutmain", life: "zindagi", meet: "milna", expect: "umeed rakhna",
    refuse: "inkar karte hain", give: "dete hain", aid: "madad", simplest: "sabse choti", even: "bhi",
    reward: "ajr", punishment: "azaab", fire: "aag", garden: "jannat", gardens: "jannat", hell: "jahannam",
    truth: "haq", book: "kitab", clear: "wazeh", light: "noor", hearts: "dil", heart: "dil",
    people: "log", mankind: "insaan", day: "din", night: "raat", remember: "yaad karo", fear: "daro",
    forgive: "maaf kar", grateful: "shukar guzar", said: "kaha", say: "kaho", moses: "Musa",
    pharaoh: "Firawn", angels: "farishte", angel: "farishta", guards: "nigran", guard: "nigran",
    messenger: "rasool", messengers: "rasool", prophet: "nabi", prophets: "anbiya",
    appoints: "muqarrar karta hai", appoint: "muqarrar karta hai", appointed: "muqarrar kiya",
    choice: "pasand", except: "siwaye", before: "aage", behind: "peeche",
    he: "woh", she: "woh", they: "woh log", them: "unko", their: "unke", his: "uska", her: "uska",
    we: "hum", us: "hum", our: "hamara", you: "tum", your: "tumhara", me: "mujhe", my: "mera",
    is: "hai", are: "hain", was: "tha", were: "the", will: "hoga", not: "nahi", no: "nahi",
    and: "aur", or: "ya", if: "agar", with: "ke saath", from: "se", to: "ko", in: "mein",
    for: "ke liye", of: "ka", on: "par", over: "par", under: "neeche", indeed: "beshak",
    surely: "beshak", then: "phir", so: "isliye", but: "lekin", when: "jab", who: "jo",
    what: "kya", which: "jo", where: "jahan", how: "kaise", has: "hai", have: "hain", had: "tha",
    do: "karte", does: "karta", did: "kiya", can: "sakta", could: "sakta", should: "chahiye",
    the: "", a: "", an: "", be: "ho", been: "raha", being: "hona"
  };

  let translated = phraseMap.reduce((value, [english, hinglish]) => {
    return value.replace(new RegExp(`\\b${escapeRegExp(english)}\\b`, "gi"), hinglish);
  }, text);

  translated = translated.replace(/\b[a-z]+\b/gi, (word) => wordMap[word.toLowerCase()] ?? word);
  return translated;
}

function fixHinglishGrammar(text) {
  return text
    .replace(/\bwoh hai Rabb ka aasmano aur zameen\b/gi, "woh aasmano aur zameen ka Rabb hai")
    .replace(/\bwoh Rabb aasmano aur zameen\b/gi, "woh aasmano aur zameen ka Rabb hai")
    .replace(/\bRabb aasmano aur zameen\b/gi, "aasmano aur zameen ka Rabb")
    .replace(/\bka aasmano aur zameen\b/gi, "aasmano aur zameen ka")
    .replace(/\bAllah hai ke saath\b/gi, "Allah saath hai")
    .replace(/\bhai ke saath\b/gi, "ke saath hai")
    .replace(/\bke liye unke\b/gi, "unke liye")
    .replace(/\bka duniya\b/gi, "duniya ka")
    .replace(/\bthis worldly zindagi\b/gi, "duniya ki zindagi")
    .replace(/\bworldly zindagi\b/gi, "duniya ki zindagi")
    .replace(/\btargheeb dete hain ko feed gareeb\b/gi, "gareebo ko khana khilane ki targheeb dete hain")
    .replace(/\btargheeb nahi dete ko feed gareeb\b/gi, "gareebo ko khana khilane ki targheeb nahi dete")
    .replace(/\bka zameen\b/gi, "zameen ka")
    .replace(/\bka aasman\b/gi, "aasman ka")
    .replace(/\s+/g, " ")
    .trim();
}

function polishHinglish(text) {
  return text
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/\s+/g, " ")
    .replace(/\bAllah\b/g, "Allah")
    .replace(/\bRabb\b/g, "Rabb")
    .replace(/\bMusa\b/g, "Musa")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function readJSON(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => els.toast.classList.remove("show"), 2600);
}

function iconDataUri() {
  return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'%3E%3Crect width='192' height='192' rx='44' fill='%23112250'/%3E%3Ccircle cx='96' cy='96' r='64' fill='%233C507D' opacity='.62'/%3E%3Cpath d='M125 47a50 50 0 1 0 0 98 60 60 0 1 1 0-98Z' fill='%23E0C58F'/%3E%3Ctext x='96' y='115' text-anchor='middle' font-size='52' font-family='serif' fill='%23F5F0E9'%3E%D9%86%3C/text%3E%3C/svg%3E";
}

function fallbackAyah() {
  return {
    surahName: "Al-Faatiha",
    surahNameArabic: "الفاتحة",
    surahNameTranslation: "The Opening",
    surahNo: 1,
    ayahNo: 6,
    arabic: "ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ",
    english: "Guide us along the Straight Path.",
    urdu: "",
    audioUrl: "https://the-quran-project.github.io/Quran-Audio/Data/1/1_6.mp3",
    reciter: "Mishary Rashid Al Afasy"
  };
}
