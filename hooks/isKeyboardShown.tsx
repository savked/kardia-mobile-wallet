import * as React from 'react';
import { EmitterSubscription, Keyboard, KeyboardEventListener, Platform } from 'react-native';

export default function useIsKeyboardShown() {
  const [isKeyboardShown, setIsKeyboardShown] = React.useState(false);

  React.useEffect(() => {
    const handleKeyboardShow = () => setIsKeyboardShown(true);
    const handleKeyboardHide = () => setIsKeyboardShown(false);

    let showHandler: EmitterSubscription, hideHandler: EmitterSubscription

    if (Platform.OS === 'ios') {
      showHandler = Keyboard.addListener('keyboardWillShow', handleKeyboardShow);
      hideHandler = Keyboard.addListener('keyboardWillHide', handleKeyboardHide);
    } else {
      showHandler = Keyboard.addListener('keyboardDidShow', handleKeyboardShow);
      hideHandler = Keyboard.addListener('keyboardDidHide', handleKeyboardHide);
    }

    return () => {
      if (showHandler) showHandler.remove()
      if (hideHandler) hideHandler.remove()
    };
  }, []);

  return isKeyboardShown;
}

export const useKeyboardHook = (onShow: KeyboardEventListener, onHide: KeyboardEventListener) => {
  React.useEffect(() => {

    let showHandler: EmitterSubscription, hideHandler: EmitterSubscription

    if (Platform.OS === 'ios') {
      showHandler = Keyboard.addListener('keyboardWillShow', onShow);
      hideHandler = Keyboard.addListener('keyboardWillHide', onHide);
    } else {
      showHandler = Keyboard.addListener('keyboardDidShow', onShow);
      hideHandler = Keyboard.addListener('keyboardDidHide', onHide);
    }

    return () => {
      if (showHandler) showHandler.remove()
      if (hideHandler) hideHandler.remove()
    };
  }, []);
}
