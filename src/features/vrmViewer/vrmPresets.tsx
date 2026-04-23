import Image from "next/image";
import React, { useContext, useState } from "react";
import { ViewerContext } from "@/features/vrmViewer/viewerContext";
import { set } from "idb-keyval";

type PresetType = {
  name: string;
  portrait_image: string;
  full_body_image: string;
  model_url: string;
};

const presets: PresetType[] = [
  {
    name: "Victoria",
    portrait_image:
      "https://vroid-hub.pximg.net/c/600x800_a2_g5/images/portrait_images/683377/5743106039793537710.png",
    full_body_image:
      "https://vroid-hub.pximg.net/c/600x800_a2_g5/images/full_body_images/683377/4346468756264534032.png",
    model_url:
      "https://cdn.jsdelivr.net/gh/hoangvu12/chatvrm_models@main/victoria.vrm",
  },
  {
    name: "Nako",
    portrait_image:
      "https://vroid-hub.pximg.net/c/600x800_a2_g5/images/portrait_images/1050536/479603243814140706.png",
    full_body_image:
      "https://vroid-hub.pximg.net/c/600x800_a2_g5/images/full_body_images/1050536/3577497687079796920.png",
    model_url:
      "https://cdn.jsdelivr.net/gh/hoangvu12/chatvrm_models@main/nako.vrm",
  },
  {
    name: "Cyber",
    portrait_image:
      "https://vroid-hub.pximg.net/c/600x800_a2_g5/images/portrait_images/3722789/913282390776114667.png",
    full_body_image:
      "https://vroid-hub.pximg.net/c/600x800_a2_g5/images/full_body_images/3722789/8420478495608108819.png",
    model_url:
      "https://cdn.jsdelivr.net/gh/hoangvu12/chatvrm_models@main/cyber.vrm",
  },
  {
    name: "Miinaa",
    portrait_image:
      "https://vroid-hub.pximg.net/c/600x800_a2_g5/images/portrait_images/3722789/2471572941268454407.png",
    full_body_image:
      "https://vroid-hub.pximg.net/c/600x800_a2_g5/images/full_body_images/3722789/6989108667050153377.png",
    model_url:
      "https://cdn.jsdelivr.net/gh/hoangvu12/chatvrm_models@main/miina.vrm",
  },
];

const VrmPresets = () => {
  return (
    <div className="flex items-center gap-[1rem]">
      {presets.map((preset) => (
        <Preset preset={preset} key={preset.name} />
      ))}
    </div>
  );
};

const Preset: React.FC<{ preset: PresetType }> = ({ preset }) => {
  const [showFullBody, setShowFullBody] = useState(false);
  const { viewer } = useContext(ViewerContext);

  const handleHover = () => {
    setShowFullBody(true);
  };

  const handleLeave = () => {
    setShowFullBody(false);
  };

  const handleClick = () => {
    viewer.loadVrm(preset.model_url);
    set("vrmModel", preset.model_url);
  };

  return (
    <div
      onMouseMove={handleHover}
      onMouseLeave={handleLeave}
      onClick={handleClick}
      className="relative grow aspect-[6/8] bg-surface3 bg-primary transition duration hover:-translate-y-8 ring-2 ring-offset-primary hover:ring-primary rounded-8"
    >
      <Image
        src={preset.portrait_image}
        alt={preset.name}
        fill
        title={preset.name}
        className={`absolute inset-0 rounded-8 ${
          !showFullBody ? "opacity-100" : "opacity-0"
        }`}
      />

      <Image
        src={preset.full_body_image}
        alt={preset.name}
        fill
        title={preset.name}
        className={`absolute inset-0 rounded-8 ${
          showFullBody ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
};

export default VrmPresets;
