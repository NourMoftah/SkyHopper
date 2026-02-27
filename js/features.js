let currentLanguage = "ar";
let currentLat = null;
let currentLng = null;
let destinationLat = null;
let destinationLng = null;
let watchId = null;
let lastBearing = null;
let currentSlideIndex = 0;
let sliderInterval = null;
let currentDestination = "kaaba";
let map1, map2;
let currentMarker1, currentMarker2;
let destinationMarker;
let routeLine;

// Toggle language
function toggleLanguage() {
  currentLanguage = currentLanguage === "ar" ? "en" : "ar";
  document.body.dir = currentLanguage === "ar" ? "rtl" : "ltr";
  document.documentElement.setAttribute(
    "dir",
    currentLanguage === "ar" ? "rtl" : "ltr",
  );
  document.documentElement.setAttribute(
    "lang",
    currentLanguage === "ar" ? "ar" : "en",
  );

  const langText = document.getElementById("langText");
  if (langText) {
    langText.textContent = currentLanguage === "ar" ? "EN" : "ع";
  }

  // Update all elements with data-ar and data-en attributes
  document.querySelectorAll("[data-ar][data-en]").forEach((el) => {
    const text = el.getAttribute("data-" + currentLanguage);
    if (text) {
      // Check if element has child elements that should be preserved
      const icon = el.querySelector("i");
      const hasIcon = icon !== null;

      if (text.includes("<")) {
        1;
        // If text contains HTML tags, use innerHTML
        el.innerHTML = text;
      } else if (hasIcon) {
        // If element has icon, preserve it and update text
        el.innerHTML = icon.outerHTML + " " + text;
      } else {
        // Plain text update
        el.textContent = text;
      }
    }
  });

  // Update map popups if maps are initialized
  if (map1 && currentMarker1) {
    const popupText1 =
      currentLanguage === "ar" ? "موقعك الحالي" : "Your Location";
    currentMarker1.setPopupContent(popupText1);
  }
  if (map2 && currentMarker2) {
    const popupText2 =
      currentLanguage === "ar" ? "موقعك الحالي" : "Your Location";
    currentMarker2.setPopupContent(popupText2);
  }
  if (map2 && destinationMarker) {
    const select = document.getElementById("destinationSelect");
    let destText = currentLanguage === "ar" ? "الوجهة" : "Destination";
    if (select && select.selectedIndex >= 0) {
      const selectedOption = select.options[select.selectedIndex];
      if (
        selectedOption.hasAttribute("data-ar") &&
        selectedOption.hasAttribute("data-en")
      ) {
        destText = selectedOption.getAttribute("data-" + currentLanguage);
      }
    }
    destinationMarker.setPopupContent(destText);
  }

  // Update select options
  document.querySelectorAll("select option").forEach((option) => {
    if (option.hasAttribute("data-ar") && option.hasAttribute("data-en")) {
      const text = option.getAttribute("data-" + currentLanguage);
      if (text) {
        option.textContent = text;
      }
    }
  });

  // Update select selected option display
  const selects = document.querySelectorAll("select");
  selects.forEach((select) => {
    const selectedOption = select.options[select.selectedIndex];
    if (
      selectedOption &&
      selectedOption.hasAttribute("data-ar") &&
      selectedOption.hasAttribute("data-en")
    ) {
      const text = selectedOption.getAttribute("data-" + currentLanguage);
      if (text) {
        selectedOption.textContent = text;
      }
    }
  });

  // Update placeholder texts
  document
    .querySelectorAll("input[placeholder], textarea[placeholder]")
    .forEach((input) => {
      const placeholderAr = input.getAttribute("data-placeholder-ar");
      const placeholderEn = input.getAttribute("data-placeholder-en");
      if (placeholderAr && placeholderEn) {
        input.placeholder =
          currentLanguage === "ar" ? placeholderAr : placeholderEn;
      }
    });

  // Update list items that have translation attributes
  document.querySelectorAll("li[data-ar][data-en]").forEach((li) => {
    const text = li.getAttribute("data-" + currentLanguage);
    if (text) {
      const icon = li.querySelector("i");
      if (icon) {
        // Preserve icon and update text
        const span = li.querySelector("span");
        if (span) {
          span.innerHTML = text;
        } else {
          li.innerHTML = icon.outerHTML + " " + text;
        }
      } else {
        li.textContent = text;
      }
    }
  });

  // Update spans inside list items
  document.querySelectorAll("li span[data-ar][data-en]").forEach((span) => {
    const text = span.getAttribute("data-" + currentLanguage);
    if (text) {
      span.innerHTML = text;
    }
  });
}

// Get current location
function getCurrentLocation() {
  if (navigator.geolocation) {
    const statusEl = document.getElementById("locationStatus");
    statusEl.innerHTML =
      "<span>" +
      (currentLanguage === "ar"
        ? "جاري تحديد الموقع..."
        : "Detecting location...") +
      "</span>";

    navigator.geolocation.getCurrentPosition(
      (position) => {
        currentLat = position.coords.latitude;
        currentLng = position.coords.longitude;

        document.getElementById("latitude").value = currentLat.toFixed(6);
        document.getElementById("longitude").value = currentLng.toFixed(6);
        document.getElementById("coordinatesDisplay").style.display = "block";
        statusEl.innerHTML =
          '<span style="color: #28a745;">✓ ' +
          (currentLanguage === "ar"
            ? "تم تحديد الموقع بنجاح"
            : "Location detected successfully") +
          "</span>";

        updateMaps();
        // Update route line if destination is set
        if (destinationLat && destinationLng) {
          updateRoute();
        }
        fetchWeather();
        updateTrafficInfo();
      },
      (error) => {
        statusEl.innerHTML =
          '<span style="color: #dc3545;">' +
          (currentLanguage === "ar"
            ? "فشل في تحديد الموقع"
            : "Failed to detect location") +
          "</span>";
      },
      { enableHighAccuracy: true },
    );
  }
}

// Initialize maps
function initMaps() {
  var map1El = document.getElementById("map1");
  var map2El = document.getElementById("map2");
  if (!map1El || !map2El) return;

  // Map 1 - Location section
  map1 = L.map("map1").setView([21.4225, 39.8262], 13);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap",
  }).addTo(map1);

  // Map 2 - Destination section
  map2 = L.map("map2").setView([21.4225, 39.8262], 13);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap",
  }).addTo(map2);

  // Ensure tiles render after layout (fixes maps not appearing in some layouts)
  setTimeout(function () {
    if (map1 && map1.invalidateSize) map1.invalidateSize();
    if (map2 && map2.invalidateSize) map2.invalidateSize();
  }, 100);
}

// Update maps with current location
function updateMaps() {
  if (!map1 || !map2) return;

  if (currentLat && currentLng) {
    const icon = L.icon({
      iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    // Map 1
    if (currentMarker1) map1.removeLayer(currentMarker1);
    currentMarker1 = L.marker([currentLat, currentLng], { icon }).addTo(map1);
    const popupText1 =
      currentLanguage === "ar" ? "موقعك الحالي" : "Your Location";
    currentMarker1.bindPopup(popupText1).openPopup();
    map1.setView([currentLat, currentLng], 15);

    // Map 2
    if (currentMarker2) map2.removeLayer(currentMarker2);
    currentMarker2 = L.marker([currentLat, currentLng], { icon }).addTo(map2);
    const popupText2 =
      currentLanguage === "ar" ? "موقعك الحالي" : "Your Location";
    currentMarker2.bindPopup(popupText2);

    if (destinationLat && destinationLng) {
      updateRoute();
    } else {
      map2.setView([currentLat, currentLng], 15);
    }

    // Update popup text if marker already exists
    if (currentMarker1) {
      currentMarker1.setPopupContent(popupText1);
    }
    if (currentMarker2) {
      currentMarker2.setPopupContent(popupText2);
    }
  }
}

// Update route line on map2
function updateRoute() {
  if (!map2 || !currentLat || !currentLng || !destinationLat || !destinationLng)
    return;

  // Remove existing route line
  if (routeLine) map2.removeLayer(routeLine);

  // Create route line
  routeLine = L.polyline(
    [
      [currentLat, currentLng],
      [destinationLat, destinationLng],
    ],
    {
      color: "#FAB20B",
      weight: 4,
      opacity: 0.8,
      dashArray: "10, 10",
    },
  ).addTo(map2);

  // Add destination marker
  const destIcon = L.icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  if (destinationMarker) map2.removeLayer(destinationMarker);
  const select = document.getElementById("destinationSelect");
  let destText = currentLanguage === "ar" ? "الوجهة" : "Destination";
  if (select && select.selectedIndex >= 0) {
    const selectedOption = select.options[select.selectedIndex];
    if (
      selectedOption.hasAttribute("data-ar") &&
      selectedOption.hasAttribute("data-en")
    ) {
      destText = selectedOption.getAttribute("data-" + currentLanguage);
    } else {
      destText = selectedOption.textContent;
    }
  }
  destinationMarker = L.marker([destinationLat, destinationLng], {
    icon: destIcon,
  }).addTo(map2);
  destinationMarker.bindPopup(destText).openPopup();

  // Fit map to show both markers
  const bounds = L.latLngBounds([
    [currentLat, currentLng],
    [destinationLat, destinationLng],
  ]);
  map2.fitBounds(bounds, { padding: [50, 50] });
}

// Set destination
function setDestination() {
  const select = document.getElementById("destinationSelect");
  const value = select.value;

  if (value) {
    const coords = value.split(",");
    destinationLat = parseFloat(coords[0]);
    destinationLng = parseFloat(coords[1]);

    const selectedText =
      select.options[select.selectedIndex].getAttribute("data-ar");

    if (selectedText.includes("الكعبة") || selectedText.includes("الحرام")) {
      currentDestination = "kaaba";
    } else if (selectedText.includes("منى")) {
      currentDestination = "mina";
    } else if (selectedText.includes("عرفات")) {
      currentDestination = "arafat";
    } else if (selectedText.includes("مزدلفة")) {
      currentDestination = "muzdalifah";
    } else if (selectedText.includes("الجمرات")) {
      currentDestination = "jamarat";
    }

    updateSliderForDestination();
    updateMaps();
    updateRoute();
    updateTrafficInfo();
  }
}

// Save hotel location
function saveHotelLocation() {
  if (!currentLat || !currentLng) {
    alert(
      currentLanguage === "ar"
        ? "يرجى تحديد موقعك الحالي أولاً"
        : "Please detect your current location first",
    );
    return;
  }

  localStorage.setItem("hotelLat", currentLat);
  localStorage.setItem("hotelLng", currentLng);

  const select = document.getElementById("destinationSelect");
  let hotelOption = document.getElementById("hotelOption");

  if (!hotelOption) {
    hotelOption = document.createElement("option");
    hotelOption.id = "hotelOption";
    select.appendChild(hotelOption);
  }

  hotelOption.value = `${currentLat},${currentLng}`;
  hotelOption.setAttribute("data-ar", "فندقي");
  hotelOption.setAttribute("data-en", "My Hotel");
  hotelOption.textContent = currentLanguage === "ar" ? "فندقي" : "My Hotel";

  showAlert(
    "hotelAlert",
    currentLanguage === "ar"
      ? "✓ تم حفظ موقع الفندق بنجاح!"
      : "✓ Hotel location saved!",
    "#d4edda",
    "#155724",
  );
}

// Load hotel location
function loadHotelLocation() {
  const hotelLat = localStorage.getItem("hotelLat");
  const hotelLng = localStorage.getItem("hotelLng");

  if (hotelLat && hotelLng) {
    destinationLat = parseFloat(hotelLat);
    destinationLng = parseFloat(hotelLng);

    // Add hotel option to select if not exists
    const select = document.getElementById("destinationSelect");
    let hotelOption = document.getElementById("hotelOption");
    if (!hotelOption) {
      hotelOption = document.createElement("option");
      hotelOption.id = "hotelOption";
      select.appendChild(hotelOption);
    }
    hotelOption.value = `${destinationLat},${destinationLng}`;
    hotelOption.setAttribute("data-ar", "فندقي");
    hotelOption.setAttribute("data-en", "My Hotel");
    hotelOption.textContent = currentLanguage === "ar" ? "فندقي" : "My Hotel";
    select.value = hotelOption.value;

    updateMaps();
    updateRoute();
    updateTrafficInfo();
    showAlert(
      "hotelAlert",
      currentLanguage === "ar"
        ? "✓ تم استرجاع موقع الفندق!"
        : "✓ Hotel location loaded!",
      "#d4edda",
      "#155724",
    );
  } else {
    showAlert(
      "hotelAlert",
      currentLanguage === "ar"
        ? "لم يتم حفظ موقع فندق بعد"
        : "No hotel location saved yet",
      "#fff3cd",
      "#856404",
    );
  }
}

// Show alert
function showAlert(elementId, message, bgColor, textColor) {
  const alert = document.getElementById(elementId);
  alert.style.display = "block";
  alert.style.background = bgColor;
  alert.style.color = textColor;
  alert.textContent = message;
  setTimeout(() => {
    alert.style.display = "none";
  }, 3000);
}

// Calculate distance
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Calculate bearing
function calculateBearing(lat1, lon1, lat2, lon2) {
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = Math.atan2(y, x);

  return ((θ * 180) / Math.PI + 360) % 360;
}

// Get direction name
function getSimpleDirection(bearing) {
  if (bearing >= 315 || bearing < 45)
    return currentLanguage === "ar" ? "للأمام" : "Forward";
  if (bearing >= 45 && bearing < 135)
    return currentLanguage === "ar" ? "يمين" : "Right";
  if (bearing >= 135 && bearing < 225)
    return currentLanguage === "ar" ? "للخلف" : "Back";
  return currentLanguage === "ar" ? "يسار" : "Left";
}

function getDirectionName(bearing) {
  return getSimpleDirection(bearing);
}

// Format time
function formatTime(minutes) {
  if (minutes < 60)
    return Math.round(minutes) + (currentLanguage === "ar" ? " دقيقة" : " min");
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return currentLanguage === "ar"
    ? `${hours} ساعة ${mins} دقيقة`
    : `${hours}h ${mins}m`;
}

// Update traffic info
function updateTrafficInfo() {
  if (currentLat && currentLng && destinationLat && destinationLng) {
    const distance = calculateDistance(
      currentLat,
      currentLng,
      destinationLat,
      destinationLng,
    );
    const km = distance / 1000;

    const walkMinutes = (km / 5) * 60;
    document.getElementById("walkTime").textContent = formatTime(walkMinutes);

    const trafficFactor = 1.2;
    const carMinutes = (km / 40) * 60 * trafficFactor;
    document.getElementById("carTime").textContent = formatTime(carMinutes);
  }
}

// Fetch weather
function fetchWeather() {
  const lat = currentLat || 21.4225;
  const lng = currentLng || 39.8262;
  const apiKey = "fead08cb297b088f45dd8b25d4130ea7";

  fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric&lang=ar`,
  )
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("temperature").textContent = Math.round(
        data.main.temp,
      );
      document.getElementById("humidity").textContent = data.main.humidity;
      document.getElementById("windSpeed").textContent = Math.round(
        data.wind.speed,
      );
      document.getElementById("weatherDesc").textContent =
        data.weather[0].description;

      // Map weather condition to Font Awesome icons
      const weatherMain = data.weather[0].main.toLowerCase();
      const weatherId = data.weather[0].id;
      let weatherIconClass = "fa-sun"; // default

      if (weatherMain.includes("clear")) {
        weatherIconClass = "fa-sun";
      } else if (weatherMain.includes("cloud")) {
        if (weatherId >= 801 && weatherId <= 804) {
          weatherIconClass = "fa-cloud";
        } else {
          weatherIconClass = "fa-cloud-sun";
        }
      } else if (
        weatherMain.includes("rain") ||
        weatherMain.includes("drizzle")
      ) {
        weatherIconClass = "fa-cloud-rain";
      } else if (weatherMain.includes("thunderstorm")) {
        weatherIconClass = "fa-cloud-bolt";
      } else if (weatherMain.includes("snow")) {
        weatherIconClass = "fa-snowflake";
      } else if (
        weatherMain.includes("mist") ||
        weatherMain.includes("fog") ||
        weatherMain.includes("haze")
      ) {
        weatherIconClass = "fa-smog";
      } else if (weatherMain.includes("wind")) {
        weatherIconClass = "fa-wind";
      }

      // Use Font Awesome 6 compatible classes
      let iconHTML = "";
      switch (weatherIconClass) {
        case "fa-sun":
          iconHTML =
            '<i class="fas fa-sun" style="font-size: 5rem; color: var(--color-accent);"></i>';
          break;
        case "fa-cloud":
          iconHTML =
            '<i class="fas fa-cloud" style="font-size: 5rem; color: var(--color-accent);"></i>';
          break;
        case "fa-cloud-sun":
          iconHTML =
            '<i class="fas fa-cloud-sun" style="font-size: 5rem; color: var(--color-accent);"></i>';
          break;
        case "fa-cloud-rain":
          iconHTML =
            '<i class="fas fa-cloud-rain" style="font-size: 5rem; color: var(--color-accent);"></i>';
          break;
        case "fa-cloud-bolt":
          iconHTML =
            '<i class="fas fa-bolt" style="font-size: 5rem; color: var(--color-accent);"></i>';
          break;
        case "fa-snowflake":
          iconHTML =
            '<i class="fas fa-snowflake" style="font-size: 5rem; color: var(--color-accent);"></i>';
          break;
        case "fa-smog":
          iconHTML =
            '<i class="fas fa-smog" style="font-size: 5rem; color: var(--color-accent);"></i>';
          break;
        case "fa-wind":
          iconHTML =
            '<i class="fas fa-wind" style="font-size: 5rem; color: var(--color-accent);"></i>';
          break;
        default:
          iconHTML =
            '<i class="fas fa-sun" style="font-size: 5rem; color: var(--color-accent);"></i>';
      }
      const weatherIconEl = document.getElementById("weatherIcon");
      if (weatherIconEl) {
        weatherIconEl.innerHTML = iconHTML;
      }
    })
    .catch((error) => {
      console.error("Weather error:", error);
      // Fallback to default values
      document.getElementById("temperature").textContent = "35";
      document.getElementById("humidity").textContent = "50";
      document.getElementById("windSpeed").textContent = "15";
      document.getElementById("weatherDesc").textContent =
        currentLanguage === "ar" ? "صافي" : "Clear";
      const weatherIconEl = document.getElementById("weatherIcon");
      if (weatherIconEl) {
        weatherIconEl.innerHTML =
          '<i class="fas fa-sun" style="font-size: 5rem; color: var(--color-accent);"></i>';
      }
    });
}

// Speak text with Arabic voice
function speak(text, lang = "ar-SA") {
  if ("speechSynthesis" in window) {
    speechSynthesis.cancel();

    // Function to actually speak
    const doSpeak = () => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.85;
      utterance.pitch = 1;
      utterance.volume = 1;

      // Try to find Arabic voice
      const voices = speechSynthesis.getVoices();
      const arabicVoice = voices.find(
        (voice) =>
          voice.lang.startsWith("ar") ||
          voice.name.toLowerCase().includes("arabic") ||
          voice.name.toLowerCase().includes("ar"),
      );

      if (arabicVoice) {
        utterance.voice = arabicVoice;
      }

      utterance.onerror = (e) => {
        console.error("Speech error:", e);
      };

      speechSynthesis.speak(utterance);
    };

    // Check if voices are loaded
    if (speechSynthesis.getVoices().length === 0) {
      // Wait for voices to load
      speechSynthesis.onvoiceschanged = () => {
        doSpeak();
      };
    } else {
      doSpeak();
    }
  }
}

// Get destination name in Arabic
function getDestinationNameArabic() {
  const select = document.getElementById("destinationSelect");
  if (!select || !select.value) return "الوجهة";

  const selectedOption = select.options[select.selectedIndex];
  const arabicName = selectedOption.getAttribute("data-ar");
  return arabicName || "الوجهة";
}

// Start voice navigation
function startVoiceNavigation() {
  if (!currentLat || !currentLng) {
    alert(
      currentLanguage === "ar"
        ? "يرجى تحديد موقعك الحالي أولاً"
        : "Please detect your current location first",
    );
    return;
  }

  if (!destinationLat || !destinationLng) {
    alert(
      currentLanguage === "ar"
        ? "يرجى اختيار الوجهة أولاً"
        : "Please select destination first",
    );
    return;
  }

  document.getElementById("voiceStatus").style.display = "inline-flex";

  // Get destination name
  const destinationName = getDestinationNameArabic();

  // Start navigation message in Arabic
  const startMsg = `بدأت الملاحة إلى ${destinationName}. استمع للإرشادات.`;
  speak(startMsg, "ar-SA");

  if (watchId) navigator.geolocation.clearWatch(watchId);

  let lastSpokenDistance = null;
  let lastSpokenSteps = null;

  watchId = navigator.geolocation.watchPosition(
    (position) => {
      const newLat = position.coords.latitude;
      const newLng = position.coords.longitude;
      const heading = position.coords.heading;

      const distance = calculateDistance(
        newLat,
        newLng,
        destinationLat,
        destinationLng,
      );
      const bearing = calculateBearing(
        newLat,
        newLng,
        destinationLat,
        destinationLng,
      );
      const steps = Math.round(distance / 0.75);
      const km = (distance / 1000).toFixed(2);

      currentLat = newLat;
      currentLng = newLng;

      document.getElementById("remainingKm").textContent = km;
      document.getElementById("remainingSteps").textContent = steps;

      const direction = getDirectionName(bearing);
      document.getElementById("directionText").textContent = direction;
      // Use Font Awesome icon instead of emoji
      document.getElementById("directionArrow").innerHTML =
        `<i class="fas fa-location-arrow" style="display: inline-block; transform: rotate(${bearing}deg); font-size: 3rem; color: var(--color-accent);"></i>`;

      // Update message
      const destinationName = getDestinationNameArabic();
      let message = `توجه إلى ${destinationName}. بقي ${steps} خطوة. المسافة المتبقية ${km} كيلومتر.`;
      document.getElementById("navigationMessage").textContent = message;

      // Speak in Arabic when steps change significantly (every 50 steps or 100 meters)
      const stepsDiff =
        lastSpokenSteps === null ? Infinity : Math.abs(steps - lastSpokenSteps);
      const distanceDiff =
        lastSpokenDistance === null
          ? Infinity
          : Math.abs(distance - lastSpokenDistance);

      if (stepsDiff >= 50 || distanceDiff >= 100) {
        const destinationName = getDestinationNameArabic();
        const speakText = `بقي ${steps} خطوة للوصول إلى ${destinationName}`;
        speak(speakText, "ar-SA");
        lastSpokenSteps = steps;
        lastSpokenDistance = distance;
      }

      // Check for wrong direction - enhanced detection
      if (heading !== null) {
        // Calculate the angle difference between heading (where user is facing) and bearing (direction to destination)
        let angleDiff = Math.abs(heading - bearing);
        // Normalize to 0-180 degrees
        if (angleDiff > 180) {
          angleDiff = 360 - angleDiff;
        }

        // Also check if user is moving away from destination
        let isMovingAway = false;
        if (lastBearing !== null) {
          const previousDistance = calculateDistance(
            lastBearing === "lat" ? currentLat - 0.0001 : currentLat,
            lastBearing === "lng" ? currentLng - 0.0001 : currentLng,
            destinationLat,
            destinationLng,
          );
          isMovingAway = distance > previousDistance;
        }

        // Show warning if angle difference is significant (more than 60 degrees) or moving away
        if (angleDiff > 60 || (isMovingAway && angleDiff > 30)) {
          const wrongAlert = document.getElementById("wrongDirectionAlert");
          wrongAlert.style.display = "block";
          wrongAlert.style.animation = "shake 0.5s ease";

          const wrongMsg =
            "تحذير! أنت تسير في الاتجاه الخاطئ! رجاءً عد إلى المسار الصحيح باتجاه الوجهة.";
          speak(wrongMsg, "ar-SA");

          // Keep warning visible longer if very wrong direction
          const timeoutDuration = angleDiff > 90 ? 8000 : 5000;
          setTimeout(() => {
            wrongAlert.style.display = "none";
            wrongAlert.style.animation = "";
          }, timeoutDuration);
        } else {
          // Hide warning if direction is correct
          document.getElementById("wrongDirectionAlert").style.display = "none";
        }
      }

      // Store previous position for movement detection
      if (lastBearing === null) {
        lastBearing = { lat: currentLat, lng: currentLng, distance: distance };
      } else {
        lastBearing.lat = currentLat;
        lastBearing.lng = currentLng;
        lastBearing.distance = distance;
      }

      lastBearing = bearing;
      updateMaps();
      updateRoute();

      if (distance < 10) {
        navigator.geolocation.clearWatch(watchId);
        const destinationName = getDestinationNameArabic();
        const arrivedMsg = `مبروك! وصلت إلى ${destinationName}!`;
        document.getElementById("navigationMessage").textContent = arrivedMsg;
        speak(arrivedMsg, "ar-SA");
        document.getElementById("voiceStatus").style.display = "none";
      }
    },
    (error) => console.error("Navigation error:", error),
    { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 },
  );
}

// Show SOS input
function showSOSInput() {
  const container = document.getElementById("sosInputContainer");
  container.style.display =
    container.style.display === "none" || container.style.display === ""
      ? "block"
      : "none";
}

// Send SOS via WhatsApp
function sendSOSWhatsApp() {
  if (!currentLat || !currentLng) {
    alert(
      currentLanguage === "ar"
        ? "يرجى تحديد موقعك الحالي أولاً"
        : "Please detect your location first",
    );
    return;
  }

  const phone = document
    .getElementById("sosPhoneInput")
    .value.replace(/[^0-9]/g, "");

  if (!phone) {
    alert(
      currentLanguage === "ar"
        ? "يرجى إدخال رقم الواتساب"
        : "Please enter WhatsApp number",
    );
    return;
  }

  const locationLink = `https://www.google.com/maps?q=${currentLat},${currentLng}`;

  let message;
  if (currentLanguage === "ar") {
    message = `طوارئ - SOS\n\nأحتاج المساعدة!\n\nموقعي الحالي:\nخط العرض: ${currentLat}\nخط الطول: ${currentLng}\n\nرابط الموقع:\n${locationLink}`;
  } else {
    message = ` Emergency - SOS\n\nI need help!\n\nMy location:\nLatitude: ${currentLat}\nLongitude: ${currentLng}\n\nLocation link:\n${locationLink}`;
  }

  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/${phone}?text=${encodedMessage}`, "_blank");
}

// ================== Slider functions  ================================
function updateSliderForDestination() {
  const allSlides = document.querySelectorAll(".slide");
  allSlides.forEach((slide) => {
    slide.style.display = "none";
    slide.classList.remove("active");
  });

  const destSlides = document.querySelectorAll(`.${currentDestination}-slide`);
  destSlides.forEach((slide) => {
    slide.style.display = "block";
  });

  if (destSlides.length > 0) {
    destSlides[0].classList.add("active");
    currentSlideIndex = 0;
  }

  // updateSliderDots();
  // startAutoSlide();
  updateSliderForDestination();
  updateSliderDots();
  startAutoSlide();
}

function updateSliderDots() {
  const visibleSlides = document.querySelectorAll(
    `.${currentDestination}-slide`,
  );
  const dotsContainer = document.getElementById("sliderDots");
  dotsContainer.innerHTML = "";

  visibleSlides.forEach((slide, index) => {
    const dot = document.createElement("span");
    dot.className = "dot" + (index === currentSlideIndex ? " active" : "");
    dot.onclick = () => goToSlide(index);
    dotsContainer.appendChild(dot);
  });
}

function changeSlide(direction) {
  const visibleSlides = document.querySelectorAll(
    `.${currentDestination}-slide`,
  );
  if (visibleSlides.length === 0) return;

  visibleSlides[currentSlideIndex].classList.remove("active");
  currentSlideIndex =
    (currentSlideIndex + direction + visibleSlides.length) %
    visibleSlides.length;
  visibleSlides[currentSlideIndex].classList.add("active");

  updateSliderDots();
  restartAutoSlide();
}

function goToSlide(index) {
  const visibleSlides = document.querySelectorAll(
    `.${currentDestination}-slide`,
  );
  if (visibleSlides.length === 0) return;

  visibleSlides[currentSlideIndex].classList.remove("active");
  currentSlideIndex = index;
  visibleSlides[currentSlideIndex].classList.add("active");

  updateSliderDots();
  restartAutoSlide();
}

function startAutoSlide() {
  if (sliderInterval) clearInterval(sliderInterval);
  sliderInterval = setInterval(() => {
    changeSlide(1);
  }, 5000);
}

function restartAutoSlide() {
  startAutoSlide();
}

// Voice navigation helper functions (deprecated - now integrated in main navigation)
function speakStepsOnly(steps) {
  const destinationName = getDestinationNameArabic();
  const text = `بقي ${steps} خطوة للوصول إلى ${destinationName}`;
  speak(text, "ar-SA");
}

function speakWrongDirection() {
  const lang = currentLanguage === "ar" ? "ar-SA" : "en-US";
  const text =
    currentLanguage === "ar"
      ? "أنت تسير في الاتجاه الخاطئ، رجاءً عد إلى المسار الصحيح"
      : "You are going in the wrong direction, please return to the correct path";

  speak(text, lang);
}

// Initialize
document.addEventListener("DOMContentLoaded", function () {
  // Set initial language based on page direction
  currentLanguage = document.body.dir === "rtl" ? "ar" : "en";

  // Initialize Leaflet maps (required for maps to appear)
  initMaps();

  // Initialize weather icon with default
  const weatherIconEl = document.getElementById("weatherIcon");
  if (weatherIconEl && !weatherIconEl.innerHTML.trim()) {
    weatherIconEl.innerHTML =
      '<i class="fas fa-sun" style="font-size: 5rem; color: var(--color-accent);"></i>';
  }

  // Initialize direction arrow if not set
  const directionArrow = document.getElementById("directionArrow");
  if (directionArrow && !directionArrow.querySelector("i.fas")) {
    directionArrow.innerHTML =
      '<i class="fas fa-location-arrow" style="font-size: 3rem; color: var(--color-accent);"></i>';
  }

  fetchWeather();
  updateSliderDots();
  startAutoSlide();

  // Ensure all translations are applied on page load
  // This will update any elements that might have been missed
  setTimeout(() => {
    document.querySelectorAll("[data-ar][data-en]").forEach((el) => {
      const text = el.getAttribute("data-" + currentLanguage);
      if (text) {
        const icon = el.querySelector("i");
        if (icon) {
          el.innerHTML = icon.outerHTML + " " + text;
        } else {
          el.textContent = text;
        }
      }
    });
  }, 100);
});
