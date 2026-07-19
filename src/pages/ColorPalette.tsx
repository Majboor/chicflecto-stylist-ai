import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ButtonCustom } from "@/components/ui/button-custom";
import { useToast } from "@/hooks/use-toast";
import {
  Palette,
  Sparkles,
  Check,
  X as XIcon,
  RotateCcw,
  Copy,
  ArrowRight,
  Shirt,
} from "lucide-react";

/**
 * Color Palette Finder
 * ---------------------
 * A fully client-side seasonal colour-analysis tool. The visitor answers a
 * short set of questions about their natural colouring (skin undertone,
 * depth of hair, eye colour and overall contrast) and we map the answers to
 * one of the four classic colour "seasons". Each season ships with a curated
 * palette of flattering shades plus a short list of tones to steer away from.
 *
 * No network calls, no auth — it is a self-contained delight/utility feature
 * that lives happily as a public page.
 */

type SeasonKey = "spring" | "summer" | "autumn" | "winter";

interface Answer {
  label: string;
  // How strongly this answer nudges each season.
  weights: Partial<Record<SeasonKey, number>>;
}

interface Question {
  id: string;
  prompt: string;
  helper: string;
  answers: Answer[];
}

interface Season {
  key: SeasonKey;
  name: string;
  tagline: string;
  description: string;
  wear: { name: string; hex: string }[];
  avoid: { name: string; hex: string }[];
}

const QUESTIONS: Question[] = [
  {
    id: "undertone",
    prompt: "What is your skin's undertone?",
    helper: "Check the veins on your wrist in natural light.",
    answers: [
      { label: "Warm — golden or peachy, veins look green", weights: { spring: 2, autumn: 2 } },
      { label: "Cool — pink or bluish, veins look blue", weights: { summer: 2, winter: 2 } },
      { label: "Neutral — a mix of both", weights: { spring: 1, summer: 1, autumn: 1, winter: 1 } },
    ],
  },
  {
    id: "depth",
    prompt: "How deep is your natural hair colour?",
    helper: "Think of your untouched, natural shade.",
    answers: [
      { label: "Light — blonde or light brown", weights: { spring: 2, summer: 2 } },
      { label: "Medium — golden or ashy brown", weights: { spring: 1, summer: 1, autumn: 1 } },
      { label: "Deep — dark brown or black", weights: { autumn: 2, winter: 2 } },
    ],
  },
  {
    id: "eyes",
    prompt: "What colour are your eyes?",
    helper: "Pick the closest match.",
    answers: [
      { label: "Warm — amber, hazel or warm brown", weights: { spring: 2, autumn: 2 } },
      { label: "Cool — blue, grey or cool green", weights: { summer: 2, winter: 1 } },
      { label: "Deep — dark brown or near-black", weights: { winter: 2, autumn: 1 } },
    ],
  },
  {
    id: "contrast",
    prompt: "How much contrast is there between your hair, skin and eyes?",
    helper: "High contrast = dark hair with light skin, for example.",
    answers: [
      { label: "High — striking, defined contrast", weights: { winter: 2, autumn: 1 } },
      { label: "Medium — noticeable but soft", weights: { spring: 1, autumn: 1 } },
      { label: "Low — everything blends softly together", weights: { summer: 2, spring: 1 } },
    ],
  },
];

const SEASONS: Record<SeasonKey, Season> = {
  spring: {
    key: "spring",
    name: "Warm Spring",
    tagline: "Fresh, light and full of warmth",
    description:
      "You glow in clear, warm and lively shades. Think of a garden in early bloom — colours that feel sunlit rather than heavy.",
    wear: [
      { name: "Coral", hex: "#FF7F50" },
      { name: "Warm Peach", hex: "#FFB07C" },
      { name: "Golden Yellow", hex: "#F5C542" },
      { name: "Fresh Green", hex: "#7FBF6B" },
      { name: "Turquoise", hex: "#40C4B7" },
      { name: "Camel", hex: "#C19A6B" },
    ],
    avoid: [
      { name: "Black", hex: "#111111" },
      { name: "Icy Grey", hex: "#C7CBD1" },
      { name: "Dusty Mauve", hex: "#9C7A8A" },
    ],
  },
  summer: {
    key: "summer",
    name: "Cool Summer",
    tagline: "Soft, cool and beautifully muted",
    description:
      "Gentle, dusty and cool-toned colours flatter you most. Picture a hazy summer sky — nothing too sharp, everything a touch softened.",
    wear: [
      { name: "Soft Rose", hex: "#E4A7B0" },
      { name: "Powder Blue", hex: "#9EC1D9" },
      { name: "Lavender", hex: "#B7A7D9" },
      { name: "Sage", hex: "#A7BFA0" },
      { name: "Slate Blue", hex: "#6E82A8" },
      { name: "Soft Plum", hex: "#8E6E86" },
    ],
    avoid: [
      { name: "Orange", hex: "#F26722" },
      { name: "Tomato Red", hex: "#E03A2F" },
      { name: "Mustard", hex: "#C9A227" },
    ],
  },
  autumn: {
    key: "autumn",
    name: "Warm Autumn",
    tagline: "Rich, earthy and deeply warm",
    description:
      "Warm, golden and earthy tones bring out your natural richness. Think of turning leaves and spice — grounded, luxurious colour.",
    wear: [
      { name: "Rust", hex: "#B7410E" },
      { name: "Olive", hex: "#708238" },
      { name: "Mustard", hex: "#C9A227" },
      { name: "Terracotta", hex: "#C56B4A" },
      { name: "Deep Teal", hex: "#1F6F72" },
      { name: "Chocolate", hex: "#5C4033" },
    ],
    avoid: [
      { name: "Icy Pink", hex: "#F3C6D3" },
      { name: "Cool Grey", hex: "#B9BEC6" },
      { name: "Fuchsia", hex: "#D91C8A" },
    ],
  },
  winter: {
    key: "winter",
    name: "Cool Winter",
    tagline: "Bold, cool and high-contrast",
    description:
      "Clear, cool and dramatic colours are your signature. Crisp snow against a night sky — you carry striking, saturated shades effortlessly.",
    wear: [
      { name: "True Red", hex: "#D0021B" },
      { name: "Emerald", hex: "#0B8457" },
      { name: "Royal Blue", hex: "#1E40AF" },
      { name: "Fuchsia", hex: "#D91C8A" },
      { name: "Pure White", hex: "#FDFDFD" },
      { name: "Jet Black", hex: "#0A0A0A" },
    ],
    avoid: [
      { name: "Beige", hex: "#D8C3A5" },
      { name: "Muted Gold", hex: "#B39B6E" },
      { name: "Warm Orange", hex: "#E8843C" },
    ],
  },
};

const SEASON_ACCENT: Record<SeasonKey, string> = {
  spring: "#F5A623",
  summer: "#8FA9C9",
  autumn: "#B7410E",
  winter: "#1E40AF",
};

function Swatch({ name, hex }: { name: string; hex: string }) {
  return (
    <div className="flex flex-col items-center gap-2 animate-fade-up">
      <div
        className="h-16 w-16 rounded-full shadow-soft ring-1 ring-black/5 sm:h-20 sm:w-20"
        style={{ backgroundColor: hex }}
        aria-hidden="true"
      />
      <div className="text-center">
        <p className="text-xs font-medium text-fashion-text">{name}</p>
        <p className="text-[10px] uppercase tracking-wide text-fashion-text/50">{hex}</p>
      </div>
    </div>
  );
}

const ColorPalette = () => {
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, number>>({});
  const [result, setResult] = useState<SeasonKey | null>(null);

  const totalSteps = QUESTIONS.length;
  const progress = result ? 100 : Math.round((step / totalSteps) * 100);

  const computeSeason = (picks: Record<string, number>): SeasonKey => {
    const scores: Record<SeasonKey, number> = {
      spring: 0,
      summer: 0,
      autumn: 0,
      winter: 0,
    };
    QUESTIONS.forEach((q) => {
      const chosen = picks[q.id];
      if (chosen === undefined) return;
      const answer = q.answers[chosen];
      (Object.keys(answer.weights) as SeasonKey[]).forEach((s) => {
        scores[s] += answer.weights[s] ?? 0;
      });
    });
    return (Object.keys(scores) as SeasonKey[]).reduce((best, s) =>
      scores[s] > scores[best] ? s : best,
    "spring");
  };

  const handleSelect = (questionId: string, answerIndex: number) => {
    const next = { ...selections, [questionId]: answerIndex };
    setSelections(next);
    if (step + 1 < totalSteps) {
      setStep(step + 1);
    } else {
      setResult(computeSeason(next));
    }
  };

  const restart = () => {
    setSelections({});
    setStep(0);
    setResult(null);
  };

  const season = result ? SEASONS[result] : null;

  const copyPalette = () => {
    if (!season) return;
    const text = `My ChicFlecto colour palette — ${season.name}\nWear: ${season.wear
      .map((c) => `${c.name} (${c.hex})`)
      .join(", ")}`;
    navigator.clipboard?.writeText(text).then(
      () =>
        toast({
          title: "Palette copied",
          description: "Your colour palette is on the clipboard.",
        }),
      () =>
        toast({
          title: "Couldn't copy",
          description: "Your browser blocked clipboard access.",
          variant: "destructive",
        }),
    );
  };

  const currentQuestion = QUESTIONS[step];
  const accent = useMemo(
    () => (result ? SEASON_ACCENT[result] : "#9B8D7A"),
    [result],
  );

  return (
    <div className="min-h-screen w-full bg-background pt-28 pb-20">
      <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Intro */}
        <div className="mb-10 text-center animate-fade-in">
          <span className="fashion-subheading text-xs">Discover your colours</span>
          <h1 className="fashion-heading mt-2 text-4xl sm:text-5xl">
            Color <span className="text-fashion-accent">Palette</span> Finder
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-fashion-text/70">
            Answer four quick questions and we&apos;ll reveal the seasonal palette that
            makes your natural colouring shine — the shades to reach for and the ones
            to leave on the rail.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-fashion-light">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, backgroundColor: accent }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-fashion-text/50">
            <span>{result ? "Complete" : `Question ${step + 1} of ${totalSteps}`}</span>
            <span>{progress}%</span>
          </div>
        </div>

        {/* Quiz */}
        {!result && currentQuestion && (
          <div key={currentQuestion.id} className="glass-card animate-scale-in p-6 sm:p-8">
            <div className="mb-6 flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-fashion-accent/10">
                <Palette className="h-5 w-5 text-fashion-accent" />
              </div>
              <div>
                <h2 className="fashion-heading text-xl sm:text-2xl">
                  {currentQuestion.prompt}
                </h2>
                <p className="mt-1 text-sm text-fashion-text/60">
                  {currentQuestion.helper}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {currentQuestion.answers.map((answer, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(currentQuestion.id, idx)}
                  className="group flex w-full items-center justify-between rounded-lg border border-fashion-dark/15 bg-white/60 px-5 py-4 text-left transition-all hover:border-fashion-accent hover:bg-fashion-light hover:shadow-soft focus:outline-none focus:ring-2 focus:ring-fashion-accent/40"
                >
                  <span className="text-sm font-medium text-fashion-text">
                    {answer.label}
                  </span>
                  <ArrowRight className="h-4 w-4 flex-shrink-0 text-fashion-accent opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
              ))}
            </div>

            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="mt-6 text-sm text-fashion-text/50 transition hover:text-fashion-text"
              >
                &larr; Back
              </button>
            )}
          </div>
        )}

        {/* Result */}
        {season && (
          <div className="animate-fade-up">
            <div
              className="glass-card overflow-hidden p-0"
              style={{ borderTop: `4px solid ${accent}` }}
            >
              <div className="p-6 text-center sm:p-8">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-fashion-accent/10 px-4 py-1.5">
                  <Sparkles className="h-4 w-4 text-fashion-accent" />
                  <span className="text-xs font-medium uppercase tracking-wide text-fashion-accent">
                    Your season
                  </span>
                </div>
                <h2 className="fashion-heading text-3xl sm:text-4xl">{season.name}</h2>
                <p className="mt-1 text-fashion-accent">{season.tagline}</p>
                <p className="mx-auto mt-4 max-w-lg text-sm text-fashion-text/70">
                  {season.description}
                </p>
              </div>

              {/* Wear */}
              <div className="border-t border-fashion-dark/10 p-6 sm:p-8">
                <div className="mb-5 flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <h3 className="fashion-heading text-lg">Colours to wear</h3>
                </div>
                <div className="grid grid-cols-3 gap-5 sm:grid-cols-6">
                  {season.wear.map((c) => (
                    <Swatch key={c.hex} name={c.name} hex={c.hex} />
                  ))}
                </div>
              </div>

              {/* Avoid */}
              <div className="border-t border-fashion-dark/10 p-6 sm:p-8">
                <div className="mb-5 flex items-center gap-2">
                  <XIcon className="h-5 w-5 text-red-500" />
                  <h3 className="fashion-heading text-lg">Colours to avoid</h3>
                </div>
                <div className="grid grid-cols-3 gap-5">
                  {season.avoid.map((c) => (
                    <Swatch key={c.hex} name={c.name} hex={c.hex} />
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <ButtonCustom
                variant="accent"
                size="lg"
                className="w-full rounded-full sm:w-auto"
                onClick={copyPalette}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy my palette
              </ButtonCustom>
              <Link to="/style-advice" className="w-full sm:w-auto">
                <ButtonCustom
                  variant="outline"
                  size="lg"
                  className="w-full rounded-full sm:w-auto"
                >
                  <Shirt className="mr-2 h-4 w-4" />
                  Get styled outfits
                </ButtonCustom>
              </Link>
              <ButtonCustom
                variant="ghost"
                size="lg"
                className="w-full rounded-full sm:w-auto"
                onClick={restart}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Retake
              </ButtonCustom>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorPalette;
