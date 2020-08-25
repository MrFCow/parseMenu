import React, {useRef, useState, useCallback} from 'react';
import { Animated } from 'react-native';


import {CameraView} from './components/cameraView';
import {PinchableBox} from './components/pinchableBox';



export default function App() {
  
  return (
    <PinchableBox>
      <CameraView />
      {/* <Animated.Image source={require('./assets/icon.png')} /> */}
    </PinchableBox>
  );
}
