import type { ReactElement } from 'react';
import { Platform, View } from 'react-native';
import Svg, { Circle, G, Rect } from 'react-native-svg';

type LedDisplayProps = {
  value: string;
  height?: number;
  color?: string;
};

const BASE_HEIGHT = 180;
const BASE_WIDTH = 100;
const BASE_THICKNESS = 18;
const BASE_GAP = 18;
const BASE_DOT_WIDTH = 26;

const DIGIT_SEGMENTS: Record<string, number[]> = {
  '0': [0, 1, 2, 4, 5, 6],
  '1': [2, 5],
  '2': [0, 2, 3, 4, 6],
  '3': [0, 2, 3, 5, 6],
  '4': [1, 2, 3, 5],
  '5': [0, 1, 3, 5, 6],
  '6': [0, 1, 3, 4, 5, 6],
  '7': [0, 2, 5],
  '8': [0, 1, 2, 3, 4, 5, 6],
  '9': [0, 1, 2, 3, 5, 6],
};

type Segment = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const SEGMENTS: Segment[] = [
  { x: BASE_THICKNESS, y: 0, width: BASE_WIDTH - BASE_THICKNESS * 2, height: BASE_THICKNESS },
  {
    x: 0,
    y: BASE_THICKNESS,
    width: BASE_THICKNESS,
    height: (BASE_HEIGHT - BASE_THICKNESS * 3) / 2,
  },
  {
    x: BASE_WIDTH - BASE_THICKNESS,
    y: BASE_THICKNESS,
    width: BASE_THICKNESS,
    height: (BASE_HEIGHT - BASE_THICKNESS * 3) / 2,
  },
  {
    x: BASE_THICKNESS,
    y: (BASE_HEIGHT - BASE_THICKNESS) / 2,
    width: BASE_WIDTH - BASE_THICKNESS * 2,
    height: BASE_THICKNESS,
  },
  {
    x: 0,
    y: (BASE_HEIGHT + BASE_THICKNESS) / 2,
    width: BASE_THICKNESS,
    height: (BASE_HEIGHT - BASE_THICKNESS * 3) / 2,
  },
  {
    x: BASE_WIDTH - BASE_THICKNESS,
    y: (BASE_HEIGHT + BASE_THICKNESS) / 2,
    width: BASE_THICKNESS,
    height: (BASE_HEIGHT - BASE_THICKNESS * 3) / 2,
  },
  {
    x: BASE_THICKNESS,
    y: BASE_HEIGHT - BASE_THICKNESS,
    width: BASE_WIDTH - BASE_THICKNESS * 2,
    height: BASE_THICKNESS,
  },
];

const cx = (...classes: Array<string | undefined>) => classes.filter(Boolean).join(' ');

const rgbaFromHex = (hexColor: string, alpha: number) => {
  if (!hexColor.startsWith('#') || hexColor.length !== 7) {
    return `rgba(255,107,0,${alpha})`;
  }
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export function LedDisplay({ value, height = 56, color = '#ff6b00' }: LedDisplayProps) {
  const scale = height / BASE_HEIGHT;
  const digitWidth = BASE_WIDTH * scale;
  const gap = BASE_GAP * scale;
  const dotWidth = BASE_DOT_WIDTH * scale;

  const chars = value.split('');
  const totalWidth = chars.reduce((sum, char, index) => {
    const width = char === '.' ? dotWidth : digitWidth;
    const extraGap = index < chars.length - 1 ? gap : 0;
    return sum + width + extraGap;
  }, 0);

  let cursorX = 0;

  const svgContent = chars.map((char, index): ReactElement => {
    const isDot = char === '.';
    const offsetX = cursorX / scale;
    const width = (isDot ? dotWidth : digitWidth) / scale;
    cursorX += (isDot ? dotWidth : digitWidth) + (index < chars.length - 1 ? gap : 0);

    if (isDot) {
      return (
        <G key={`dot-${index}`} x={offsetX} y={0}>
          <Circle
            cx={width / 2}
            cy={BASE_HEIGHT - BASE_THICKNESS / 2}
            r={BASE_THICKNESS / 2}
            fill={color}
            opacity={0.25}
          />
          <Circle
            cx={width / 2}
            cy={BASE_HEIGHT - BASE_THICKNESS / 2}
            r={BASE_THICKNESS / 2}
            fill={color}
          />
        </G>
      );
    }

    const activeSegments = DIGIT_SEGMENTS[char] ?? [];

    return (
      <G key={`digit-${index}`} x={offsetX} y={0}>
        {SEGMENTS.map((segment, idx) => (
          <Rect
            key={`dim-${idx}`}
            x={segment.x}
            y={segment.y}
            width={segment.width}
            height={segment.height}
            rx={BASE_THICKNESS / 2}
            ry={BASE_THICKNESS / 2}
            fill={color}
            opacity={0.2}
          />
        ))}
        {activeSegments.map((segmentIndex) => {
          const segment = SEGMENTS[segmentIndex];
          return (
            <Rect
              key={`lit-${segmentIndex}`}
              x={segment.x}
              y={segment.y}
              width={segment.width}
              height={segment.height}
              rx={BASE_THICKNESS / 2}
              ry={BASE_THICKNESS / 2}
              fill={color}
            />
          );
        })}
      </G>
    );
  });

  const containerStyle =
    Platform.OS === 'web'
      ? {
          boxShadow: `inset 0 0 18px ${rgbaFromHex(color, 0.2)}`,
        }
      : {
          shadowColor: color,
          shadowOpacity: 0.25,
          shadowRadius: 12,
          elevation: 3,
        };

  return (
    <View
      className={cx('rounded-2xl border border-border/70 bg-bg-3 px-4 py-3')}
      style={containerStyle}
    >
      {Platform.OS === 'web' ? (
        <svg
          width={totalWidth}
          height={height}
          viewBox={`0 0 ${totalWidth / scale} ${BASE_HEIGHT}`}
          fill="none"
        >
          {svgContent}
        </svg>
      ) : (
        <Svg
          width={totalWidth}
          height={height}
          viewBox={`0 0 ${totalWidth / scale} ${BASE_HEIGHT}`}
        >
          {svgContent}
        </Svg>
      )}
    </View>
  );
}
