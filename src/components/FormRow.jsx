import React, { useState, useEffect } from 'react'
import { TouchableWithoutFeedback } from 'react-native'
import { AntDesign } from '@expo/vector-icons'

import { useTheme, useData } from '../hooks/'

import Text from '../components/Text'
import Block from '../components/Block'

const FormRow = ({ type, label, values, renderValueSelector, categoryId }) => {
    const { sizes, colors } = useTheme()
    const { masterData } = useData()

    const [occasions, setOccasions] = useState([])
    const [categories, setCategories] = useState([])
    const [masterDataColors, setMasterDataColors] = useState([])
    const [materials, setMaterials] = useState([])
    const [patterns, setPatterns] = useState([])
    const [openValueSelector, setOpenValueSelector] = useState(false)

    const typeValuesMap = {
        'Occasions': occasions,
        'Categories': categories,
        'Colors': masterDataColors,
        'Materials': materials,
        'Patterns': patterns,
    }

    // Fetch occasions in master data
    useEffect(() => {
        if (masterData) {
            setOccasions(masterData.Occasions)
            setCategories(masterData.Categories)
            setMasterDataColors(masterData.Colors)
            setMaterials(masterData.Materials)
            setPatterns(masterData.Patterns)
        }
    }, [masterData])

    const formatValue = () => {
        if (type === 'Closets' && values) {
            return values.length
        }

        if (type === 'Categories' && categoryId) {
            const childCategory = categories.find(category => category.id === categoryId)
            const parentCategory = categories.find(category => category.id === childCategory.parent_id)
            return parentCategory && parentCategory.name + ' > ' + childCategory.name
        }

        if (type && values) {
            const typeValues = typeValuesMap[type].filter(typeValue => values.includes(typeValue.id))
            const valueNames = typeValues.slice(0, 3).map(value => value.name)
            let displayValue = valueNames.join(', ')
            if (values.length > 3) {
                displayValue += ',...'
            }
            return displayValue
        }
    }

    return (
        <Block paddingVertical={sizes.s} borderBottomWidth={0.8} borderColor={colors.light}>
            <TouchableWithoutFeedback onPress={() => setOpenValueSelector(prev => !prev)}>
                <Block>
                    <Block flex={1} row align='center' justify='space-between' paddingVertical={sizes.s}>
                        <Text p semibold marginRight={sizes.sm}>
                            {label}
                        </Text>
                        <Block flex={0} row align='center'>
                            <Text p semibold color={colors.info} marginRight={sizes.s}>
                                {formatValue()}
                            </Text>
                            <AntDesign
                                size={20}
                                name={openValueSelector ? 'up' : 'down'}
                                color={colors.icon}
                            />
                        </Block>
                    </Block>

                    {openValueSelector &&
                        <Block paddingVertical={sizes.s}>
                            {renderValueSelector && renderValueSelector()}
                        </Block>
                    }
                </Block>
            </TouchableWithoutFeedback>
        </Block>   
    )
}

export default React.memo(FormRow)
