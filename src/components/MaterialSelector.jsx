import React, { useState, useEffect } from 'react'

import { useData } from '../hooks/'

import Block from './Block'
import MaterialTag from './MaterialTag'

const OccasionSelector = ({ selectedMaterialIds, handlePressMaterialTag }) => {
    const { masterData } = useData()

    const [materials, setMaterials] = useState([])

    // Fetch materials in master data
    useEffect(() => {
        setMaterials(masterData?.Materials)
    }, [masterData.Materials])

    return (
        <Block row flex={1} wrap="wrap" justify="flex-start">
            {materials.map((material) => {
                const isSelected = selectedMaterialIds.includes(material.id)
                return (
                    <MaterialTag
                        key={`material-${material.id}`}
                        material={material}
                        isSelected={isSelected}
                        onPress={() => handlePressMaterialTag(material.id)}
                    />
                )
            })}
        </Block>
    )
}

export default React.memo(OccasionSelector)
