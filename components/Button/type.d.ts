interface ButtonProps {
    onPress: () => void;
    title?: string;
    icon?: any;
    style?: any;
    textStyle?: any;
    iconName?: string;
    iconSize?: number;
    iconColor?: string;
    size?: "small" | "medium" | "large";
    type?: "primary" | "secondary" | "outline" | "ghost" | "link";
    block?: boolean;
}