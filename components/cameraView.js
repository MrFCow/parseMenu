import React, {useState, useEffect} from 'react';
import { Platform, Button, Text, StyleSheet, View, PanResponder } from 'react-native';

// 3rd party packages
import * as ImagePicker from 'expo-image-picker';
import {Svg, Polyline, Image} from 'react-native-svg';

// utils 
import {zip, callGoogleVisionAsync, parseGoogleResultBlockBoundingBox, parseGoogleResultBlockText} from '../utils/cameraViewUtils';

const imageAreaSize = {
  width:500,
  height:500
}

function SelectablePolyLine(props){
  //console.log(props);
  const panResponder = React.useRef(
    PanResponder.create({
      // Ask to be the responder:
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) =>
        true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) =>
        true,

      onPanResponderGrant: (evt, gestureState) => {
        // The gesture has started. Show visual feedback so the user knows
        // what is happening!
        // gestureState.d{x,y} will be set to zero now
        console.log("touch started");
        //console.log(props.onPress);
        props.onPress(evt);
      },
      onPanResponderMove: (evt, gestureState) => {
        // The most recent move distance is gestureState.move{X,Y}
        // The accumulated gesture distance since becoming responder is
        // gestureState.d{x,y}
        //console.log("touch move");
      },
      onPanResponderTerminationRequest: (evt, gestureState) =>
        true,
      onPanResponderRelease: (evt, gestureState) => {
        // The user has released all touches while this view is the
        // responder. This typically means a gesture has succeeded
        //console.log("touch released");
      },
      onPanResponderTerminate: (evt, gestureState) => {
        // Another component has become the responder, so this gesture
        // should be cancelled
      },
      onShouldBlockNativeResponder: (evt, gestureState) => {
        // Returns whether this component should block native components from becoming the JS
        // responder. Returns true by default. Is currently only supported on android.
        return true;
      }
    })
  ).current;

  // Debug show props
  // useEffect(()=>{
  //   console.log(props);
  // },[])

  return (
    //<View {...panResponder.panHandlers} >
      <Polyline {...props} {...panResponder.panHandlers}/>
    //</View>
  )
}

function CameraView() {
  const [image, setImage] = useState(null);
  // const [gRes, setGRes] = useState(null);
  const [blocks, setBlocks] = useState(null);
  const [message, setMessage] = useState(null);
  const [imgSize, setImgSize] = useState({width:0,height:0});

  // Debug Msg, run once
  useEffect(()=>{
    console.log(`Code Version: 20200623-2303`);
    console.log(`Platform: ${Platform.OS}`);
  },[])

  // debug image
  useEffect(()=>{
    console.log(`image: ${JSON.stringify(image)}`);
  },[image])

  const processPicture = async ({ cancelled, uri, base64, width, height }) => {
    if (!cancelled) {
      setImage(uri);

      console.log(`image size: ${width}x$${height}`);
      setImgSize({width:width, height:height})
      setMessage('Loading...');
      try {
        const result = await callGoogleVisionAsync(base64);
        // setGRes(result);
        const coords = parseGoogleResultBlockBoundingBox(result);
        const text = parseGoogleResultBlockText(result);
        const blocks = zip(coords,text);
        //console.log(blocks)
        setBlocks(blocks);
        setMessage(`number of paragraphs: ${blocks.length}`);
      } catch (error) {
        console.log(error);
        setMessage(`Error: ${error.message}`);
      }
    } else {
      setImage(null);
      // setGRes(null);
      setMessage(null);
    }
  }

  const takePictureAsync = async () => {
    const result = await ImagePicker.launchCameraAsync({
      base64: true,
    });
    processPicture(result);
  }

  const loadLibraryPictureAsync = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      base64: true,
    });
    processPicture(result);
  }

  return (
    <View style={styles.container}>
      {image && <Svg width={imageAreaSize.width} height={imageAreaSize.height} viewBox={`0 0 ${imgSize.width} ${imgSize.height}`}>
        <Image 
          //href={image}
          xlinkHref={image}
        />
        {
          // block is zip of coord and text
          blocks && blocks.map((block, i) => {
            const points = `${block[0][0].x},${block[0][0].y} ${block[0][1].x},${block[0][1].y} ${block[0][2].x},${block[0][2].y} ${block[0][3].x},${block[0][3].y}`;
            //console.log(points);
            return (
              <SelectablePolyLine key={i}
                points={points}
                fill="none"
                stroke="red"
                strokeWidth="5"
                theText={block[1]}
                onPress={(e)=>{
                  console.log(points);
                  // console.log(e);
                  console.log(block[1]); // text
                }}
              />
            )
          })
        }
      </Svg>}
      <Text style={styles.text}>
        {message}
      </Text>
      <Button onPress={takePictureAsync} title="Take a Picture" />
      <Button onPress={loadLibraryPictureAsync} title="Load a Picture" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: imageAreaSize.width,
    height: imageAreaSize.height,
  },
  text: {
    margin: 5,
  }
});

export {CameraView}