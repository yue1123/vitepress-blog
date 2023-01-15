const cache = new Map<string, string>()

export async function renderPlantUml(uri: string) {
  const _cache = cache.get(uri)
  if (_cache) return _cache
  const svg = await loadPlantUmlSvg(uri)
  cache.set(uri, svg)
  return svg
}
export function loadPlantUmlSvg(url: string) {
  return new Promise<string>((resolve, reject) => {
    var xhr = new XMLHttpRequest()
    xhr.open('GET', url)
    xhr.onreadystatechange = function (data: any) {
      if (xhr.readyState == 4) {
        if (xhr.status == 200) {
          resolve(data.currentTarget.responseText.replace('<?xml version="1.0" encoding="UTF-8" standalone="no"?>', ''))
        } else {
          console.log(123)
          reject(new Error('Error PlantUml - XMLHttpRequest status: ' + xhr.status))
        }
      }
    }
    xhr.send()
  })
}
