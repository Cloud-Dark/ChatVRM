const fs = require("fs");
const path = require("path");

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");

  // spacing fix function
  const roundSpace = (px) => {
    const val = parseInt(px, 10);
    return Math.round(val / 4);
  };

  const roundedFix = (px) => {
    const val = parseInt(px, 10);
    if (val <= 8) return "rounded-lg";
    if (val <= 12) return "rounded-xl";
    if (val <= 16) return "rounded-2xl";
    if (val <= 24) return "rounded-3xl";
    return `rounded-[${px}px]`;
  };

  // Replace class mappings
  content = content.replace(/\b(p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap)-(\d+)\b/g, (match, type, val) => {
    // Some are standard 0,1,2,3,4,5,6,8,10,12,16,20,24,32,40,48,56,64,72
    // If val is > 10, it's mostly a pixel value. Let's convert all of them
    if (parseInt(val) > 10 || val === '8' || val === '10' || val === '12' || val === '14' || val === '16' || val === '18' || val === '20' || val === '22' || val === '24' || val === '28' || val === '72') {
        const rounded = roundSpace(val);
        return `${type}-${rounded}`;
    }
    return match; // Keep small numbers
  });

  // Typography
  content = content.replace(/\btypography-20\b/g, "text-xl leading-tight");
  content = content.replace(/\btypography-32\b/g, "text-3xl leading-tight");

  // Rounded
  content = content.replace(/\brounded-(\d+)\b/g, (match, val) => {
    return roundedFix(val);
  });

  // Heights / Widths
  content = content.replace(/\bh-44\b/g, "h-11");
  content = content.replace(/\bh-168\b/g, "h-40");

  // Fix radio buttons layout on setup cards
  content = content.replace(/<label className=\{`cursor-pointer/g, "<label className={`cursor-pointer flex flex-col");
  content = content.replace(/<input\s+type="radio"\s+className="([^"]+)"\s+(.*?)\s+\/>\s*<span className="font-bold">([^<]+)<\/span>/gs, "<div className=\"flex items-center\"><input type=\"radio\" className=\"$1\" $2 /> <span className=\"font-bold\">$3</span></div>");

  fs.writeFileSync(filePath, content);
  console.log("Fixed", filePath);
}

fixFile("./src/components/introduction.tsx");
fixFile("./src/components/settings.tsx");
