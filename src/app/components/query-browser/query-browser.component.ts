import { MatSnackBar } from '@angular/material'
import { DataService } from './../../services/data.service'
import { Component, OnInit } from '@angular/core'
import { StorageService } from '../../services/storage.service'
import * as _ from 'lodash'
import { DialogService } from '../../services/dialog.service'
import { AppsService } from '../../services/apps.service'
import { HistoryService } from '../../services/history.service'
import { Router } from '@angular/router'

@Component({
  selector: 'app-query-browser',
  templateUrl: './query-browser.component.html',
  styleUrls: ['./query-browser.component.scss']
})
export class QueryBrowserComponent implements OnInit {
  constructor(
    private data: DataService,
    private snackbar: MatSnackBar,
    private storage: StorageService,
    private dialog: DialogService,
    private appsSrv: AppsService,
    private router: Router,
    private historySrv: HistoryService
  ) { }

  path = 'dinosaurs'
  query = 'ref'

  result = Promise.resolve(null)
  loading = false

  ngOnInit() {
    if (!this.appsSrv.activeProjectId) {
      this.router.navigate(['/add'])
      return
    }

    this.fetchResults({
      addToHistory: false
    })
  }

  fetchResults(options = { addToHistory: true }) {
    const { addToHistory } = options
    this.loading = true
    this.result = this.data.get({
      path: this.path,
      query: this.query
    })

    this.result
      .catch(err => this.snackbar.open(err, 'OK', { duration: 5000 }))
      .then(() => this.loading = false)

    if (addToHistory) {
      this.historySrv.addEntry({ path: this.path, query: this.query })
    }
  }

  setAndFetch(entry) {
    if (entry.path) {
      this.path = entry.path
    }
    if (entry.query) {
      this.query = entry.query
    }
    this.fetchResults()
  }

  async deleteResults() {
    await this.dialog.delete({
      path: this.path,
      query: this.query
    })
      .take(1)
      .toPromise()

    this.fetchResults()
  }

  async create() {
    await this.dialog.create({
      path: this.path
    })
      .take(1)
      .toPromise()

    this.fetchResults()
  }

  async editResults() {
    const res = await this.data.get({
      path: this.path,
      query: this.query
    })
    const collection = Array.isArray(res) ? res : [res]

    if (collection.length === 0) return

    const paths = collection.map(doc => doc.path)
    const template = collection[0].data

    await this.dialog.edit({
      template,
      paths
    })
      .take(1)
      .toPromise()

    this.fetchResults()
  }

}
