# Visual Effects

> scene-director에서 정의한 effect 타입을 scene-coder가 구현할 때 참조하는 가이드

## 지원 효과 목록

| effect_name | 설명 | 구현 방식 |
|-------------|------|-----------|
| `snow` | 눈 내리는 효과 | particle animation |
| `rain` | 비 내리는 효과 | particle animation |
| `fire` | 불꽃/화염 | gradient + flicker |
| `glow` | 빛나는 효과 | box-shadow pulse |
| `smoke` | 연기 효과 | opacity gradient |

---

## Snow Effect (눈)

```tsx
import {useCurrentFrame, useVideoConfig, random} from 'remotion';

interface SnowflakeProps {
  id: number;
  delay: number;
}

const Snowflake: React.FC<SnowflakeProps> = ({id, delay}) => {
  const frame = useCurrentFrame();
  const {height, width} = useVideoConfig();

  // 각 눈송이별 고유 속성 (seed 기반 랜덤)
  const startX = random(`snow-x-${id}`) * width;
  const size = 4 + random(`snow-size-${id}`) * 8; // 4~12px
  const speed = 2 + random(`snow-speed-${id}`) * 3; // 2~5
  const wobble = random(`snow-wobble-${id}`) * 30; // 좌우 흔들림 폭

  const adjustedFrame = Math.max(0, frame - delay);
  const y = (adjustedFrame * speed) % (height + 50) - 50;
  const x = startX + Math.sin(adjustedFrame * 0.05) * wobble;
  const opacity = 0.5 + random(`snow-opacity-${id}`) * 0.5;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: 'white',
        opacity,
        filter: 'blur(1px)',
        pointerEvents: 'none',
      }}
    />
  );
};

export const SnowEffect: React.FC<{intensity?: number}> = ({intensity = 50}) => {
  const snowflakes = Array.from({length: intensity}, (_, i) => ({
    id: i,
    delay: Math.floor(random(`snow-delay-${i}`) * 30),
  }));

  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none'}}>
      {snowflakes.map((flake) => (
        <Snowflake key={flake.id} {...flake} />
      ))}
    </div>
  );
};
```

**사용 예시:**
```tsx
<SnowEffect intensity={80} /> {/* 눈송이 80개 */}
```

---

## Rain Effect (비)

```tsx
import {useCurrentFrame, useVideoConfig, random} from 'remotion';

interface RaindropProps {
  id: number;
  delay: number;
}

const Raindrop: React.FC<RaindropProps> = ({id, delay}) => {
  const frame = useCurrentFrame();
  const {height, width} = useVideoConfig();

  const startX = random(`rain-x-${id}`) * width;
  const length = 15 + random(`rain-length-${id}`) * 20; // 15~35px
  const speed = 15 + random(`rain-speed-${id}`) * 10; // 15~25 (빠름)

  const adjustedFrame = Math.max(0, frame - delay);
  const y = (adjustedFrame * speed) % (height + length) - length;
  const opacity = 0.3 + random(`rain-opacity-${id}`) * 0.4;

  return (
    <div
      style={{
        position: 'absolute',
        left: startX,
        top: y,
        width: 2,
        height: length,
        background: `linear-gradient(to bottom, transparent, rgba(200, 200, 255, ${opacity}))`,
        pointerEvents: 'none',
      }}
    />
  );
};

export const RainEffect: React.FC<{intensity?: number}> = ({intensity = 100}) => {
  const raindrops = Array.from({length: intensity}, (_, i) => ({
    id: i,
    delay: Math.floor(random(`rain-delay-${i}`) * 15),
  }));

  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none'}}>
      {raindrops.map((drop) => (
        <Raindrop key={drop.id} {...drop} />
      ))}
    </div>
  );
};
```

**사용 예시:**
```tsx
<RainEffect intensity={120} /> {/* 빗방울 120개 */}
```

---

## Fire Effect (불꽃)

```tsx
import {useCurrentFrame, interpolate, random} from 'remotion';

interface FlameProps {
  id: number;
  baseX: number;
  baseY: number;
}

const Flame: React.FC<FlameProps> = ({id, baseX, baseY}) => {
  const frame = useCurrentFrame();

  const size = 20 + random(`flame-size-${id}`) * 30;
  const flickerSpeed = 0.2 + random(`flame-flicker-${id}`) * 0.3;
  const offsetX = random(`flame-offsetX-${id}`) * 40 - 20;

  // 불꽃 깜빡임
  const flicker = Math.sin(frame * flickerSpeed) * 0.3 + 0.7;
  const scaleY = 1 + Math.sin(frame * flickerSpeed * 1.5) * 0.2;

  // 위로 올라가는 움직임
  const riseOffset = Math.sin(frame * 0.1 + random(`flame-phase-${id}`) * Math.PI * 2) * 10;

  return (
    <div
      style={{
        position: 'absolute',
        left: baseX + offsetX,
        bottom: baseY - riseOffset,
        width: size,
        height: size * 1.5,
        background: `radial-gradient(ellipse at bottom,
          rgba(255, 200, 50, ${flicker}) 0%,
          rgba(255, 100, 0, ${flicker * 0.8}) 40%,
          rgba(255, 50, 0, ${flicker * 0.5}) 70%,
          transparent 100%)`,
        borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
        transform: `scaleY(${scaleY})`,
        filter: 'blur(2px)',
        pointerEvents: 'none',
      }}
    />
  );
};

export const FireEffect: React.FC<{
  x?: number;
  y?: number;
  intensity?: number;
}> = ({x = 960, y = 100, intensity = 8}) => {
  const flames = Array.from({length: intensity}, (_, i) => ({
    id: i,
    baseX: x - 50 + (i / intensity) * 100,
    baseY: y,
  }));

  return (
    <div style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
      {flames.map((flame) => (
        <Flame key={flame.id} {...flame} />
      ))}
    </div>
  );
};
```

**사용 예시:**
```tsx
<FireEffect x={500} y={150} intensity={10} /> {/* 화면 하단 중앙에 불꽃 */}
```

---

## Glow Effect (빛남)

```tsx
import {useCurrentFrame, interpolate} from 'remotion';

export const GlowEffect: React.FC<{
  color?: string;
  size?: number;
  x?: number;
  y?: number;
  pulseSpeed?: number;
}> = ({
  color = 'rgba(255, 215, 0, 0.8)',
  size = 200,
  x = 960,
  y = 540,
  pulseSpeed = 0.1,
}) => {
  const frame = useCurrentFrame();

  // 부드러운 펄스 효과
  const pulse = interpolate(
    Math.sin(frame * pulseSpeed),
    [-1, 1],
    [0.6, 1],
  );

  const glowSize = size * pulse;

  return (
    <div
      style={{
        position: 'absolute',
        left: x - glowSize / 2,
        top: y - glowSize / 2,
        width: glowSize,
        height: glowSize,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: 'blur(20px)',
        pointerEvents: 'none',
      }}
    />
  );
};
```

**사용 예시:**
```tsx
<GlowEffect color="rgba(255, 100, 100, 0.6)" size={300} x={500} y={400} />
```

---

## Smoke Effect (연기)

```tsx
import {useCurrentFrame, useVideoConfig, random, interpolate} from 'remotion';

interface SmokeParticleProps {
  id: number;
  startX: number;
  startY: number;
  startFrame: number;
}

const SmokeParticle: React.FC<SmokeParticleProps> = ({id, startX, startY, startFrame}) => {
  const frame = useCurrentFrame();
  const lifetime = 60; // 60프레임 후 사라짐

  const age = frame - startFrame;
  if (age < 0 || age > lifetime) return null;

  const progress = age / lifetime;

  // 위로 올라가며 퍼짐
  const y = startY - age * 3;
  const x = startX + Math.sin(age * 0.1 + random(`smoke-wobble-${id}`) * Math.PI) * 20;
  const size = 30 + progress * 80; // 커지면서 퍼짐

  const opacity = interpolate(progress, [0, 0.3, 1], [0, 0.4, 0]);

  return (
    <div
      style={{
        position: 'absolute',
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        borderRadius: '50%',
        background: `radial-gradient(circle, rgba(100, 100, 100, ${opacity}) 0%, transparent 70%)`,
        filter: 'blur(10px)',
        pointerEvents: 'none',
      }}
    />
  );
};

export const SmokeEffect: React.FC<{
  x?: number;
  y?: number;
  intensity?: number;
}> = ({x = 960, y = 800, intensity = 20}) => {
  const frame = useCurrentFrame();

  // 일정 간격으로 연기 생성
  const particles = Array.from({length: intensity}, (_, i) => ({
    id: i,
    startX: x + random(`smoke-x-${i}`) * 60 - 30,
    startY: y,
    startFrame: Math.floor(i * 3), // 3프레임 간격으로 생성
  }));

  return (
    <div style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
      {particles.map((particle) => (
        <SmokeParticle key={particle.id} {...particle} />
      ))}
    </div>
  );
};
```

**사용 예시:**
```tsx
<SmokeEffect x={600} y={700} intensity={15} />
```

---

## 씬에서 사용하기

```tsx
import {AbsoluteFill} from 'remotion';
import {SnowEffect} from '../effects/SnowEffect';
import {FireEffect} from '../effects/FireEffect';

export const S1: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* 배경 */}
      <Img src={staticFile('assets/backgrounds/bg_s1.png')} />

      {/* 콘텐츠 */}
      <div>...</div>

      {/* 효과 (최상단 레이어) */}
      <SnowEffect intensity={60} />
    </AbsoluteFill>
  );
};
```

---

## 효과 컴포넌트 위치

효과 컴포넌트는 `remotion/src/effects/` 폴더에 저장:

```
remotion/src/
├── effects/
│   ├── SnowEffect.tsx
│   ├── RainEffect.tsx
│   ├── FireEffect.tsx
│   ├── GlowEffect.tsx
│   └── SmokeEffect.tsx
├── scenes/
│   └── S1.tsx
└── Root.tsx
```

> ⚠️ 효과는 항상 **콘텐츠 위, 자막 아래** 레이어에 배치 (zIndex 조절)
