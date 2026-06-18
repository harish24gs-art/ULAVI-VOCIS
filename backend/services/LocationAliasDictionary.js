export const LocationAliasDictionary = {
  "Chennai": [
    "chennai", "chenai", "channai", "madras", "சென்னை", "சென்னையிலிருந்து", "சென்னைக்கு",
    "चेन्नई", "تشيناي", "تشennai", "chennai city", "chennai central"
  ],
  "Chennai Airport": [
    "chennai airport", "chennai international airport", "madras airport", "maa airport", "meenambakkam airport", "சென்னை airport",
    "சென்னை விமான நிலையம்", "chennai air port", "chenai airport", "channai airport"
  ],
  "Coimbatore": [
    "coimbatore", "koimbatore", "koyambatore", "koyambuthur", "coimbator", "kovai",
    "கோயம்பத்தூர்", "கோவை", "कोयंबटूर", "کوئمبتور"
  ],
  "Villivakkam": [
    "villivakkam", "villivakam", "villiwakkam", "willyvakkam", "willywelcome", "villivakkum",
    "வில்லிவாக்கம்", "வில்லிவாக்கத்துக்கு", "villivakkam varaikum"
  ],
  "Madurai": ["madurai", "madhurai", "mathurai", "மதுரை", "मदुरै"],
  "Madurai Airport": ["madurai airport", "madhurai airport", "மதுரை விமான நிலையம்"],
  "Trichy": ["trichy", "tiruchy", "tiruchirappalli", "திருச்சி"],
  "Salem": ["salem", "சேலம்"],
  "Erode": ["erode", "ஈரோடு"],
  "Tiruppur": ["tiruppur", "திருப்பூர்"],
  "Bangalore": ["bangalore", "bengaluru", "பெங்களூர்", "बैंगलोर"],
  "Hyderabad": ["hyderabad", "ஹைதராபாத்", "हैदराबाद"],
  "Mumbai": ["mumbai", "bombay", "மும்பை", "मुंबई"],
  "Delhi": ["delhi", "new delhi", "டெல்லி", "दिल्ली"],
  "Kochi": ["kochi", "cochin", "കൊച്ചി"],
  "Thiruvananthapuram": ["trivandrum", "thiruvananthapuram", "തിരുവനന്തപുരം"],
  "Kolkata": ["kolkata", "calcutta", "কলকাতা"],
  "Dhaka": ["dhaka", "ঢাকা"],
  "Dubai": ["dubai", "دبي"],
  "Doha": ["doha", "الدوحة"],
  "Singapore": ["singapore", "சிங்கப்பூர்", "新加坡"],
  "Changi Airport": ["changi", "changi airport", "singapore airport", "sin airport", "樟宜机场"],
  "Johor Bahru": ["johor bahru", "johor", "jb", "ஜோஹோர்", "جوهور بهرو"],
  "Kuala Lumpur": ["kuala lumpur", "kl", "கோலாலம்பூர்"],
  "KLIA": ["klia", "kuala lumpur airport", "kl airport"]
};

export const LocationAliasEntries = Object.entries(LocationAliasDictionary).flatMap(([normalizedValue, aliases]) =>
  aliases.map((alias) => ({ normalizedValue, alias }))
);
