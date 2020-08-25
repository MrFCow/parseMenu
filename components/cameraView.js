import React, {useState, useEffect, useCallback} from 'react';
import { Platform, Button, Text, StyleSheet, View, Animated, Dimensions  } from 'react-native';

// 3rd party packages
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import {Svg, Polyline, Image} from 'react-native-svg';

// utils 
import {zip, callGoogleVisionAsync, parseGoogleResultBlockBoundingBox, parseGoogleResultBlockText} from '../utils/cameraViewUtils';

const imageAreaSize = {
  width:500,
  height:500
}

/* 
  Props:
  {
    style => reanimated style, like: [styles.box, { transform: [{ translateX: this.transX }] }]
  }
*/
function CameraView(props) {
  console.log(props)
  const [image, setImage] = useState(null);
  // const [gRes, setGRes] = useState(null);
  const [blocks, setBlocks] = useState(null);
  const [message, setMessage] = useState(null);
  const [imgSize, setImgSize] = useState({width:0,height:0});

  // Debug -- Msg, run once
  useEffect(()=>{
    console.log(`Code Version: 20200807-1352`);
    console.log(`Platform: ${Platform.OS}`);
  },[]);

  // Debug -- image
  /*
  useEffect(()=>{
    console.log(`image: ${JSON.stringify(image)}`);
  },[image]);
  */

  // get an base64 image and call Google API, then get back blocks
  const processPicture = useCallback( async ({ cancelled, uri, base64, width, height }) => {
    if (!cancelled) {
      setImage(uri);
      
      // handle for web view does not return base 64
      let base64Data;
      if (Platform.OS === 'web'){
        base64Data = uri.split(',').slice(-1)[0];
        width=500;
        height=500;
      }
      else{
        base64Data = base64;
      }

      console.log(`image size: ${width}x$${height}`);
      setImgSize({width:width, height:height})
      setMessage('Loading...');

      try {
        const result = await callGoogleVisionAsync(base64Data);
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
  });

  // Rotate image if necessary
  //  result is object from ImagePicker.launchCameraAsync or ImagePicker.launchImageLibraryAsync
  //  which might contain keys: { cancelled: bool, type: string, uri, width, height, exif, base64 }
  const rotateImage = useCallback(async (result) => {
    let updatedResult = result;
    if (result.exif && result.exif.Orientation){
      console.log(`With Orientation: ${result.exif.Orientation}`);

      updatedResult = await ImageManipulator.manipulateAsync(result.uri, [
          {
            rotate: -result.exif.Orientation
          }, 
          // {
          //   resize: {
          //       width: result.width,
          //       height: result.height
          //   }
          // }
        ],
        {
          compress: 1
        }
      );
    }
    else if(result.width > 0 && result.height > 0 && result.width > result.height){
      console.log('Height > Width');

      updatedResult = await ImageManipulator.manipulateAsync(result.uri, [
          {
            rotate: 90
          }, 
          // {
          //     resize: {
          //         width: result.width,
          //         height: result.height
          //     }
          // }
        ], 
        {
            compress: 1
        }
      );
    }
    return updatedResult;
  });

  // function on take picture button
  const takePictureAsync = useCallback(async () => {
    let result = await ImagePicker.launchCameraAsync({
      base64: true,
      exif: true,
    });
    result = await rotateImage(result);
    processPicture(result);
  });

  // function on load from library button
  const loadLibraryPictureAsync = useCallback(async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      exif: true,
    });
    result = await rotateImage(result);
    // console.log(Object.keys(result)); // no exif for some strange reason
    processPicture(result);
  });

  return (
      <View style={styles.container}>
        <Animated.View style={props.style}>
          <Text>{JSON.stringify(props.style)}</Text>
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
                  // <SelectablePolyLine key={i}
                  <Polyline key={i}
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
        </Animated.View>
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
  view:{
    width: Math.round(Dimensions.get('window').width)
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