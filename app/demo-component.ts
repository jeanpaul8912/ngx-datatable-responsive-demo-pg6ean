import {
  Component,
  ViewChild,
  AfterViewInit,
  TemplateRef,
  OnInit
} from '@angular/core';
import { MockServerResultsService } from './paging/mock-server-results-service';
import { PagedData } from './paging/model/paged-data';
import { CorporateEmployee } from './paging/model/corporate-employee';
import { Page } from './paging/model/page';

@Component({
  selector: 'ngx-datatable-demo',
  providers: [MockServerResultsService],
  template: `
    <div>
      <ngx-datatable
        #myTable
        class="material"
        [rows]="rows"
        [columns]="columns"
        [columnMode]="'force'"
        [headerHeight]="50"
        [loadingIndicator]="isLoading"
        [scrollbarV]="true"
        [footerHeight]="50"
        [rowHeight]="50"
        [externalPaging]="true"
        [count]="page.totalElements"
        [offset]="page.pageNumber"
        (page)="setPage($event)"
      >
      </ngx-datatable>
    </div>
    <ng-template #buttonsTemplate let-row="row" let-value="value">
      <button class="btn btn-transparent" (click)="onSelect(row)">
        Button2
      </button>
    </ng-template>
  `,
  styleUrls: ['./demo-component.scss']
})
export class DemoComponent implements OnInit, AfterViewInit {
  page = new Page();
  rows = new Array<CorporateEmployee>();
  columns = [];
  cache: any = {};

  @ViewChild('myTable') table;
  @ViewChild('buttonsTemplate') buttonsTemplate: TemplateRef<any>;

  private isLoading: boolean = false;

  constructor(private serverResultsService: MockServerResultsService) {
    this.setPage({ offset: 0, pageSize: 10 });
  }

  ngOnInit() {
    this.columns = [
      { prop: 'name', name: 'Name' },
      { prop: 'gender', name: 'Gender' },
      { prop: '', name: 'Actions', cellTemplate: this.buttonsTemplate }
    ];
  }

  onSelect(row) {
    console.log(row);
  }

  ngAfterViewInit() {
    this.table.bodyComponent.updatePage = function(direction: string): void {
      let offset = this.indexes.first / this.pageSize;

      if (direction === 'up') {
        offset = Math.ceil(offset);
      } else if (direction === 'down') {
        offset = Math.floor(offset);
      }

      if (direction !== undefined && !isNaN(offset)) {
        this.page.emit({ offset });
      }
    };
  }

  /**
   * Populate the table with new data based on the page number
   * @param page The page to select
   */
  setPage(pageInfo) {
    this.isLoading = true;
    this.page.pageNumber = pageInfo.offset;
    this.page.size = pageInfo.pageSize;

    this.serverResultsService.getResults(this.page).subscribe(pagedData => {
      this.page = pagedData.page;

      let rows = this.rows;
      if (rows.length !== pagedData.page.totalElements) {
        rows = Array.apply(null, Array(pagedData.page.totalElements));
        rows = rows.map((x, i) => this.rows[i]);
      }

      // calc start
      const start = this.page.pageNumber * this.page.size;

      // set rows to our new rows
      pagedData.data.map((x, i) => (rows[i + start] = x));
      this.rows = rows;
      this.isLoading = false;
    });
  }
}
