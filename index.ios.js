// @flow

import React, { Component } from 'react'
import {
  AppRegistry,
  Clipboard,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native'

const searchDict = (dict, word) => {
  const binarySearchDict = (dict, word) => {
    let lo = 0
    let hi = dict.length - 1
    while (lo <= hi) {
      const mid = lo + Math.floor((hi - lo) / 2)
      const midWord = dict[mid][1]
      if (midWord === word) {
        return mid
      } else if (midWord < word) {
        lo = mid + 1
      } else {
        hi = mid - 1
      }
    }
    return -1
  }

  let wordIndex = -1
  while (word.length > 0 && wordIndex === -1) {
    wordIndex = binarySearchDict(dict, word)
    word = word.slice(0, -1)
  }
  return wordIndex === -1 ? null : dict[wordIndex]
}

export default class PopupDictionary extends Component {
  constructor () {
    super()
    const initialWords = '你好，你可以在这里粘贴一些文本呢'.split('')
    this.state = {
      words: initialWords,
      wordIndex: -1,
      savedTranslations: [],
      view: 'read'
    }
    this.dict = JSON.parse(require('./dict.json'))
      .sort((a, b) => a[1].localeCompare(b[1]))
  }

  async pasteClipboard () {
    try {
      const content = await Clipboard.getString()
      if (content || content === 'null') {
        this.setState({ words: content.split('') })
      }
    } catch (error) {
      console.log(error)
    }
  }

  changeWordIndex (wordIndex) {
    this.setState({ wordIndex })
  }

  saveTranslation (translation) {
    this.setState({
      savedTranslations: [...this.state.savedTranslations, translation]
    })
  }

  switchView (view) {
    const views = ['study', 'read']
    if (!views.includes(view)) {
      throw new Error(
        `Invalid view name: ${view}. Your options are: ${views.join(', ')}`
      )
    } else {
      this.setState({ view })
    }
  }

  render () {
    const { words, wordIndex, savedTranslations, view } = this.state
    const word = words.slice(wordIndex, wordIndex + 12).join('')
    const translation = searchDict(this.dict, word)
    let trad = null
    let simp = null
    let pinyin = null
    let def = null
    if (translation) {
      [trad, simp, pinyin, def] = translation
    }

    return (
      <View style={styles.container}>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            style={[styles.button, { flex: 0.3, backgroundColor: 'skyblue' }]}
          >
            <Text
              style={styles.buttonText}
              onPress={() =>
                this.switchView(view === 'study' ? 'read' : 'study')}
            >
              {view === 'study' ? 'Read' : 'Study'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => this.pasteClipboard()}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Paste from clipboard</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.words}>
          {words.map((word, i) => {
            const selectedStyle = { backgroundColor: 'skyblue' }
            const normalStyle = {}
            const style = wordIndex <= i && trad && i < wordIndex + trad.length
              ? selectedStyle
              : normalStyle
            return (
              <Text
                key={i}
                style={[styles.word, style]}
                onPress={() => this.changeWordIndex(i)}
              >
                {word}
              </Text>
            )
          })}
        </View>
        {translation
          ? <View style={styles.translation}>
            <ScrollView>
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => this.saveTranslation(translation)}
                  >
                  <Text style={styles.translationText}>+</Text>
                </TouchableOpacity>
                <Text style={styles.translationText}>
                  {[simp, trad, pinyin].join(' ; ')}
                </Text>
              </View>
              <Text style={styles.translationText}>{def}</Text>
            </ScrollView>
          </View>
          : null}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5FCFF',
    flex: 1,
    flexDirection: 'column'
  },
  button: {
    padding: 15,
    backgroundColor: 'powderblue'
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 22
  },
  words: {
    flexDirection: 'row',
    flex: 0.7,
    flexWrap: 'wrap'
  },
  word: {
    fontSize: 32,
    width: 32,
    height: 42,
    flexWrap: 'wrap'
  },
  translation: {
    flex: 0.3,
    backgroundColor: 'steelblue'
  },
  translationText: {
    fontSize: 22,
    color: 'white'
  },
  addButton: {
    backgroundColor: 'skyblue',
    width: 30,
    alignItems: 'center'
  }
})

AppRegistry.registerComponent('PopupDictionary', () => PopupDictionary)
