import React, { useRef, useState, useEffect } from 'react'
import { PanResponder, Animated } from 'react-native'

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
    const panRef = useRef(new Animated.ValueXY()).current

    const panResponder = PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gesture) => {
            setPosition({
                x: position.x + gesture.dx,
                y: position.y + gesture.dy,
            })
        },
        onPanResponderRelease: (_, gesture) => {
            setPosition({
                x: position.x + gesture.dx,
                y: position.y + gesture.dy,
            })
        },
    })

    useEffect(() => {
        if (lastPosition) {
            setPosition(lastPosition)
        }
    }, [])

    useEffect(() => {
        panRef.setValue({ x: position.x, y: position.y })
        onDrag(index, { x: position.x, y: position.y })
    }, [position])

    return (
        <Animated.View
            style={{
                width: width,
                height: height,
                transform: [{ translateX: panRef.x }, { translateY: panRef.y }],
            }}
            {...panResponder.panHandlers}
            onTouchStart={() => onDrag(index, position)}
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
    )
}

export default React.memo(DraggableImage)
