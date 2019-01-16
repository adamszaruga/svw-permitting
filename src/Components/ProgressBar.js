import React, { Component } from 'react';
import $ from 'jquery';
import moment from 'moment'
import { compose, withState} from 'recompose';

const enhance = compose(
    withState('activeSection', 'setActiveSection', null),
    withState('previousActive', 'setPreviousActive', false)
)

const STATUS_MAP = {
    review: "In Review",
    comments: "Comment Received",
    approved: "Permit Approved",
    cancelled: "Permit Cancelled",
    denied: "Permit Denied",
    new: "New Project"
}

const COLOR_MAP = {
    review: "info",
    comments: "danger",
    approved: "success",
    cancelled: "dark",
    denied: "danger",
    new: "secondary"
}

class ProgressBar extends Component {
    componentDidMount() {
        this.props.setPreviousActive(this.props.active);
        let popovers = $(`.popover-${this.props.project.id}`)
        popovers.popover({
            template: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-header p-1"></h3><div class="popover-body p-0"></div></div>'
        })  
        if (this.props.active) {
            popovers.popover('enable')
        } else {
            popovers.popover('disable')
        }  
    }
    componentDidUpdate() {
        let popovers = $(`.popover-${this.props.project.id}`)
        if (this.props.active) {
            popovers.popover('enable')    
        } else {    
            popovers.popover('disable')
        }
    }
    componentWillUnmount() {
        let popovers = $(`.popover-${this.props.project.id}`)
        popovers.popover('dispose');
    }

    sectionFocusHandler(event, index, milestone) {
        event.stopPropagation();
        let popOverContent = $(`#pop-${this.props.project.id}${index}`);

        if (this.props.active) {
            if (popOverContent) {
                let notes = milestone.notes;
                if (notes && notes.length > 0) {
                    popOverContent.html(`
                    <ul class="list-group list-group-flush rounded-bottom">
                        ${notes.reverse().map(({timestamp, text}) => {
                            return `
                            <li class="list-group-item p-1">
                                <i class="text-muted">${moment(timestamp).format('MMM D, h:mm a')}</i></br> ${text}
                            </li>
                            `
                        }).join('')}
                    </ul>
                    `)
                }
            }
        } else {
            $('.progress-section').blur();
            let popovers = $(`.popover-${this.props.project.id}`)
            $(popovers[index]).popover('enable');
            $(popovers[index]).popover('show');
        }
           
    }

    render() {
        let now = new Date();
        let defaultMilestones = [{
            status: "new",
            timestamp: now.toString(),
            notes: []
        }]
        let milestones = this.props.project.milestones || defaultMilestones;
        milestones = milestones.length > 0 ? milestones : defaultMilestones;
        let sum = 0;
        let durations = milestones.map((milestone, index) => {
            let milestoneStart = moment(milestone.timestamp);
            let milestoneEnd = index === milestones.length - 1 ? moment(now) : moment(milestones[index + 1].timestamp);
            let duration = moment.duration(milestoneStart.diff(milestoneEnd, 'seconds'), 'seconds');
            sum += duration;
            return duration;
        })
        let widths = durations.map(duration => {
            return sum === 0 ? 100 : Math.max(Math.floor(100 * duration / sum), 5)
        })
        let endLength = widths[widths.length - 1];
        const maxEndLength = 40;
        if (widths.length > 1 && endLength > maxEndLength) {
            let amountToDistribute = endLength - maxEndLength;
            let evenDivide = Math.floor(amountToDistribute / widths.length-1);
            widths = widths.map((width, i) => i === widths.length - 1 ? maxEndLength : width+evenDivide)
            let newSum = widths.reduce((acc, width)=>acc+width, 0);
            while (newSum < 100) {
                widths[widths.length-1]++
                newSum++;
            }
        }

        return (
            <div className="w-100 d-flex mt-2">
                {milestones.map((milestone, index) => {
                    let milestoneStart = moment(milestone.timestamp);
                    let duration = durations[index];
                    let width = widths[index]+'%';
                    let minWidth = index===milestones.length-1 ? '20%' : '7%';
                    
                    return (
                        <div className={`pr-1 progress-section popover-${this.props.project.id}`} key={index} data-toggle="popover"
                            onFocus={(e)=>this.sectionFocusHandler(e, index, milestone)}
                            tabIndex={-1}
                            data-html={true}
                            style={{width, minWidth}}
                            data-placement="bottom"
                            data-trigger="hover focus"
                            title={`${STATUS_MAP[milestone.status]} - ${duration.humanize()}`}
                            data-content={`<div id="pop-${this.props.project.id}${index}"><i class="d-block text-muted text-center">${milestone.notes.length > 0 ? `Click to view ${milestone.notes.length} notes`: `No notes` }</i></div>`}
                            >
                            
                            <div className="date ">
                                <span className="text-nowrap"> {milestoneStart.format('MMM D')} </span>
                            </div>
                            <div className="position-relative my-2">
                                <span className={`bar d-block w-100 bg-${COLOR_MAP[milestone.status]} shadow-sm`} style={{height: "2px"}}></span>
                                <span className={`circle d-block position-absolute rounded-circle bg-${COLOR_MAP[milestone.status]} shadow-sm`} style={{width: '10px', height: '10px', top: '-4px'}}></span>
                                {index === milestones.length - 1 ? <span style={{ top: -8, right: 0 }} className={`m-0 px-3 py-1 position-absolute badge badge-pill badge-${COLOR_MAP[milestone.status]}`}>{STATUS_MAP[milestone.status]}</span> : null}
                            </div>
                        </div>
                    )
                })} 
            </div>
        )
    }
}

export default enhance(ProgressBar);