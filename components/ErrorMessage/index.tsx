import React from 'react';
import CustomText from '../Text';
import {styles} from './style';
const ErrMessage = (props: any) => {
  return props.message ? (
    <CustomText  style={styles.text}>{props.message}</CustomText>
  ) : (
    <></>
  );
};

export default ErrMessage;
