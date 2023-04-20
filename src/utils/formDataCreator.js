import { Platform } from 'react-native'
import * as mime from 'react-native-mime-types'

export const createFormDataFromUri = (uploadKey, imageUri) => {
  let filename = imageUri.split('/').pop()
  let type = mime.lookup(imageUri)

  const formData = new FormData()

  formData.append(uploadKey, {
    uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
    type: type,
    name: filename,
  })

  return formData
}
