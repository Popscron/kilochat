import { Text, type StyleProp, type TextProps, type TextStyle } from 'react-native';

type HighlightedTextProps = TextProps & {
  text: string;
  query: string;
  highlightStyle: StyleProp<TextStyle>;
};

/** Renders `text` with every case-insensitive match of `query` emphasised. */
export function HighlightedText({ text, query, highlightStyle, ...props }: HighlightedTextProps) {
  const needle = query.trim();
  if (!needle) return <Text {...props}>{text}</Text>;

  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));

  return (
    <Text {...props}>
      {parts.map((part, index) =>
        part.toLowerCase() === needle.toLowerCase() ? (
          <Text key={index} style={highlightStyle}>
            {part}
          </Text>
        ) : (
          part
        )
      )}
    </Text>
  );
}
