import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core'

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit {

  constructor() { }

  @ViewChild('editor') editor: ElementRef

  @Input() query: string
  @Output() queryChange = new EventEmitter()
  snippetRegex = /#\{([^#.]*)\}/

  ngOnInit() {

  }

  add(text: string, defaultPos = null) {
    const pos = typeof defaultPos === 'number' ? defaultPos : this.getCursorPos()
    let val = this.query
    const splitVal = val.split('')
    if (pos >= splitVal.length) {
      splitVal.push(text)
    } else {
      splitVal[pos] = `${text}${splitVal[pos]}`
    }
    val = splitVal.join('')
    this.setQuery(val)
    this.editor.nativeElement.focus()

    setTimeout(() => {
      if (this.snippetInQuery()) return this.selectNextSnippet(pos)
      const newCursorPos = pos + text.length
      this.setCursorPos(newCursorPos)
    }, 0)
  }

  indentedAdd(text) {
    const pos = this.getCursorPos()
    const isNewLine = pos === 0 ? true : this.query[pos - 1] === '\n'
    const newText = isNewLine ? '  ' + text : text
    this.add(newText)
  }

  tab(event) {
    event.preventDefault()
    if (this.snippetInQuery()) return this.selectNextSnippet()
    this.add('  ')
  }

  toggleComment() {
    const pos = this.getCursorPos()
    const posAfterNewLine = this.posAfterPrevNewLine()
    if (this.query.substr(posAfterNewLine, 2) === '//') {
      this.setQuery(this.query.substr(0, posAfterNewLine) + this.query.substr(posAfterNewLine + 2))
      setTimeout(() => {
        this.setCursorPos(pos)
      }, 0)
      return
    }
    this.add('//', posAfterNewLine)
  }

  addAfterLine(inputText) {
    let text = inputText
    if (this.query.indexOf('\n') === -1) {
      text = '\n' + text
    }
    const posAfterNewLine = this.posAfterNextNewLine()
    this.add(text, posAfterNewLine)
  }

  snippetInQuery() {
    return !!this.query.match(this.snippetRegex)
  }

  protected setQuery(query) {
    this.query = query
    this.queryChange.emit(this.query)
  }

  protected posAfterPrevNewLine() {
    const pos = this.getCursorPos()
    const text: string = this.query.substr(0, pos)
    return text.lastIndexOf('\n') + 1
  }

  protected posAfterNextNewLine() {
    const pos = this.getCursorPos()
    const text: string = this.query.substr(pos)
    return pos + text.indexOf('\n') + 1
  }

  protected getCursorPos() {
    return this.editor.nativeElement.selectionEnd
  }

  protected setCursorPos(pos) {
    this.editor.nativeElement.selectionStart = pos
    this.editor.nativeElement.selectionEnd = pos
  }

  protected selectNextSnippet(defaultPos = null) {
    const pos = this.getNextSnippetPos(defaultPos)
    this.selectText(pos)
  }

  protected getNextSnippetPos(defaultPos = null) {
    const pos = typeof defaultPos === 'number' ? defaultPos : this.getCursorPos()
    const upcomingText = this.query.substr(pos)
    const found = upcomingText.match(this.snippetRegex)
    if (!found) return pos === 0 ? null : this.getNextSnippetPos(0)
    return {
      start: pos + found.index,
      end: pos + found.index + found[0].length
    }
  }

  protected selectText(pos?: { start: number, end: number }) {
    if (!pos) return
    const { start, end } = pos
    this.editor.nativeElement.selectionStart = start
    this.editor.nativeElement.selectionEnd = end
    this.editor.nativeElement.focus()
  }
}
