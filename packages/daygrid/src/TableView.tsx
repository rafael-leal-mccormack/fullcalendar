import {
  VNode, h,
  createFormatter,
  View,
  memoize,
  getViewClassNames,
  GotoAnchor,
  SimpleScrollGrid,
  SimpleScrollGridSection,
  ChunkContentCallbackArgs
} from '@fullcalendar/core'
import TableDateProfileGenerator from './TableDateProfileGenerator'


const WEEK_NUM_FORMAT = createFormatter({ week: 'numeric' })


/* An abstract class for the daygrid views, as well as month view. Renders one or more rows of day cells.
----------------------------------------------------------------------------------------------------------------------*/
// It is a manager for a Table subcomponent, which does most of the heavy lifting.
// It is responsible for managing width/height.


export default abstract class TableView<State={}> extends View<State> {

  protected processOptions = memoize(this._processOptions)
  private colWeekNumbersVisible: boolean // computed option


  renderLayout(headerRowContent: VNode | null, bodyContent: (contentArg: ChunkContentCallbackArgs) => VNode) {
    let { props } = this
    let classNames = getViewClassNames(props.viewSpec).concat('fc-dayGrid-view')

    this.processOptions(this.context.options)

    let cols = []
    if (this.colWeekNumbersVisible) {
      cols.push({ width: 'shrink' })
    }

    let sections: SimpleScrollGridSection[] = []

    if (headerRowContent) {
      sections.push({
        type: 'head',
        chunk: {
          rowContent: headerRowContent
        }
      })
    }

    sections.push({
      type: 'body',
      vGrow: true,
      chunk: {
        content: bodyContent
      }
    })

    return (
      <div class={classNames.join(' ')}>
        <SimpleScrollGrid
          vGrow={!props.isHeightAuto}
          forPrint={props.forPrint}
          cols={cols}
          sections={sections}
        />
      </div>
    )
  }


  private _processOptions(options) {
    let cellWeekNumbersVisible: boolean
    let colWeekNumbersVisible: boolean

    if (options.weekNumbers) {
      if (options.weekNumbersWithinDays) {
        cellWeekNumbersVisible = true
        colWeekNumbersVisible = false
      } else {
        cellWeekNumbersVisible = false
        colWeekNumbersVisible = true
      }
    } else {
      colWeekNumbersVisible = false
      cellWeekNumbersVisible = false
    }

    this.colWeekNumbersVisible = colWeekNumbersVisible

    return { cellWeekNumbersVisible, colWeekNumbersVisible }
  }


  /* Header Rendering
  ------------------------------------------------------------------------------------------------------------------*/


  // Generates the HTML that will go before the day-of week header cells
  renderHeadIntro = (): VNode[] => {
    let { theme, options } = this.context

    if (this.colWeekNumbersVisible) {
      return [
        <th class={'shrink fc-week-number ' + theme.getClass('tableCellHeader')}>
          <div data-fc-width-all={1}>
            <span data-fc-width-content={1}>
              {options.weekLabel}
            </span>
          </div>
        </th>
      ]
    }

    return []
  }


  /* Table Rendering
  ------------------------------------------------------------------------------------------------------------------*/


  // Generates the HTML that will go before content-skeleton cells that display the day/week numbers
  renderNumberIntro = (row: number, cells: any): VNode[] => {
    let { options, dateEnv } = this.context
    let weekStart = cells[row][0].date
    let colCnt = cells[0].length

    if (this.colWeekNumbersVisible) {
      return [
        <td class='fc-week-number shrink'>
          <div data-fc-width-all={1}>
            <GotoAnchor
              navLinks={options.navLinks}
              gotoOptions={{ date: weekStart, type: 'week', forceOff: colCnt === 1 }}
              extraAttrs={{
                'data-fc-width-content': 1
              }}
            >{dateEnv.format(weekStart, WEEK_NUM_FORMAT)}</GotoAnchor>
          </div>
        </td>
      ]
    }

    return []
  }


  // Generates the HTML that goes before the day bg cells for each day-row
  renderBgIntro = (): VNode[] => {
    let { theme } = this.context

    if (this.colWeekNumbersVisible) {
      return [
        <td class={'fc-week-number ' + theme.getClass('tableCellNormal')}></td>
      ]
    }

    return []
  }


  // Generates the HTML that goes before every other type of row generated by Table.
  // Affects mirror-skeleton and highlight-skeleton rows.
  renderIntro = (): VNode[] => {

    if (this.colWeekNumbersVisible) {
      return [
        <td class='fc-week-number '></td>
      ]
    }

    return []
  }

}

TableView.prototype.dateProfileGeneratorClass = TableDateProfileGenerator


export function isEventLimitAuto(options) { // TODO: use in other places?
  let eventLimit = options.eventLimit

  return eventLimit && typeof eventLimit !== 'number'
}
