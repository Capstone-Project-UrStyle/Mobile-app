import React, { useRef, useState, useEffect } from 'react'
import { PanResponder, Animated } from 'react-native'
import {
    PinchGestureHandler,
    RotationGestureHandler,
    State,
} from 'react-native-gesture-handler'

import Image from './Image'

const DraggableImage = ({
    index,
    width,
    height,
    source,
    lastPosition,
    onDrag,
}) => {
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [rotate, setRotate] = useState(0)
    const panRef = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current
    const scaleRef = useRef(new Animated.Value(1)).current
    const rotationRef = useRef(new Animated.Value(0)).current

    const panResponder = PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) => {
            return gesture.numberActiveTouches === 1
        },
        onPanResponderMove: (_, gesture) => {
            const { numberActiveTouches } = gesture
            if (numberActiveTouches === 1) {
                setPosition({
                    x: position.x + gesture.dx,
                    y: position.y + gesture.dy,
                })
            }
        },
        onPanResponderRelease: (_, gesture) => {
            const { dx, dy, numberActiveTouches } = gesture
            if (numberActiveTouches === 1) {
                setPosition({
                    x: position.x + dx,
                    y: position.y + dy,
                })
            }
        },
    })

    const handlePinchGestureEvent = Animated.event(
        [{ nativeEvent: { scale: scaleRef } }],
        { useNativeDriver: true },
    )

    const handleRotationGestureEvent = Animated.event(
        [{ nativeEvent: { rotation: rotationRef } }],
        { useNativeDriver: true },
    )

    useEffect(() => {
        if (lastPosition) {
            setPosition(lastPosition)
        }
    }, [])

    useEffect(() => {
        panRef.setValue({ x: position.x, y: position.y })
        rotationRef.setValue(rotate)
        onDrag(index, { x: position.x, y: position.y })
    }, [position, rotate])

    return (
        <Animated.View
            style={{
                position: 'absolute',
                width: width,
                height: height,
                transform: [
                    { translateX: panRef.x },
                    { translateY: panRef.y },
                    { scale: scaleRef },
                    {
                        rotate: rotationRef.interpolate({
                            inputRange: [-180, 180],
                            outputRange: ['-180deg', '180deg'],
                        }),
                    },
                ],
            }}
            {...panResponder.panHandlers}
            onTouchStart={() => onDrag(index, position)}
        >
            <PinchGestureHandler onGestureEvent={handlePinchGestureEvent}>
                <Animated.View
                    style={{
                        position: 'absolute',
                        width: width,
                        height: height,
                    }}
                >
                    <RotationGestureHandler
                        onGestureEvent={handleRotationGestureEvent}
                        onHandlerStateChange={({ nativeEvent }) => {
                            if (nativeEvent.oldState === State.ACTIVE) {
                                setRotate(rotate + nativeEvent.rotation * 180 / Math.PI)
                            }
                        }}
                    >
                        <Animated.View
                            style={{
                                position: 'absolute',
                                width: width,
                                height: height,
                            }}
                        >
                            <Image
                                resizeMode="contain"
                                style={{
                                    width: width,
                                    height: height,
                                }}
                                source={source}
                            />
                        </Animated.View>
                    </RotationGestureHandler>
                </Animated.View>
            </PinchGestureHandler>
        </Animated.View>
    )
}

export default React.memo(DraggableImage)
