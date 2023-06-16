import { Alert } from 'react-native'

export const showSelectImageSourceAlert = (
    translation,
    navigation,
    imageUri,
    handleUploadImage,
) => {
    if (translation && navigation && handleUploadImage) {
        Alert.alert(
            translation('selectImageSourceAlert.chooseImageSourceModalTitle'),
            translation('selectImageSourceAlert.chooseImageSourceModalContent'),
            [
                {
                    text: translation('selectImageSourceAlert.cancel'),
                    style: 'cancel',
                    onPress: async () => {
                        if (!imageUri) navigation.goBack()
                    },
                },
                {
                    text: translation('selectImageSourceAlert.fromCamera'),
                    onPress: async () => {
                        let result = await handleUploadImage(true)
                        if (result.canceled && !imageUri) navigation.goBack()
                    },
                },
                {
                    text: translation('selectImageSourceAlert.fromLibrary'),
                    onPress: async () => {
                        let result = await handleUploadImage(false)
                        if (result.canceled && !imageUri) navigation.goBack()
                    },
                },
            ],
        )
    }
}
