import React, { useState, useEffect } from 'react'

import { useData } from '../hooks/'

import Block from './Block'
import PatternTag from './PatternTag'

const PatternSelector = ({ selectedPatternIds, handlePressPatternTag }) => {
    const { masterData } = useData()

    const [patterns, setPatterns] = useState([])

    // Fetch patterns in master data
    useEffect(() => {
        setPatterns(masterData?.Patterns)
    }, [masterData.Patterns])

    return (
        <Block
            row
            flex={1}
            wrap="wrap"
            justify="flex-start"
        >
            {patterns.map((pattern) => {
                const isSelected = selectedPatternIds.includes(pattern.id)
                return (
                    <PatternTag
                        key={`pattern-${pattern.id}`}
                        pattern={pattern}
                        isSelected={isSelected}
                        onPress={() =>
                            handlePressPatternTag(
                                pattern.id,
                            )
                        }
                    />
                )
            })}
        </Block>
    )
}

export default React.memo(PatternSelector)
