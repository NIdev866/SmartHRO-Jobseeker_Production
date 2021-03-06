import React, { Component, PropTypes } from 'react';
import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card';
import { Checkbox } from "material-ui"
import jobs from "../jobs.json"
import { Field, FieldArray, reduxForm } from 'redux-form'
import { connect } from "react-redux"
import { getFormValues } from 'redux-form'
import { fetchCompanies, fetchAllCampaigns } from '../actions'


import ReactHtmlParser from 'react-html-parser'

import CircularProgress from 'material-ui/CircularProgress';


const google = window.google

class CheckboxComponent extends Component{
  constructor(props){
    super(props)
    this.state = {
      checked: false
    }
    this.seeIfDisabled = this.seeIfDisabled.bind(this)
    this.updateCheck = this.updateCheck.bind(this)
    this.props.fields.remove(0)
  }
  updateCheck() {
    this.setState((oldState) => {
      return {
        checked: !oldState.checked,
      }
    }, ()=>{
      if(this.state.checked){
        this.props.countBoxesTicked(true)
        this.props.fields.push(this.props.jobSelected)
      }
      else if(!this.state.checked){
        this.props.countBoxesTicked(false)
        if(this.props.jobsSelectedValues){
          this.props.jobsSelectedValues.map((singleField, index)=>{
            if(this.props.jobSelected === singleField){
              this.props.fields.remove(index)
            }
          })
        }
      }
    })
  }
  seeIfDisabled(){
    if(this.props.boxesTicked < 3){
      return false
    }
    else if(this.props.boxesTicked >= 3 && !this.state.checked){
      return true
    }
  }
  render(){
    return(
      <div>
        <Checkbox
          disableTouchRipple
          disabled={this.seeIfDisabled()}
          onCheck={this.updateCheck.bind(this)}
        />
      </div>
    )
  }
}

CheckboxComponent = connect(
  state => {
    if(state.form.wizard.values){
      return{
        jobsSelectedValues: state.form.wizard.values.jobsSelected,
      }
    }
  }
)(CheckboxComponent)






class CardExampleExpandable extends Component{
  constructor(props){
    super(props)
    this.state = {
      boxesTicked: 0,
    }
    this.countBoxesTicked = this.countBoxesTicked.bind(this)
    this.currentCampaignSalaryType = this.currentCampaignSalaryType.bind(this)
    this.createDuration = this.createDuration.bind(this)
    this.handleWhichJobType = this.handleWhichJobType.bind(this)
  }
  countBoxesTicked(value){
    if(value){
      this.setState({boxesTicked: this.state.boxesTicked+1})
    }
    else{
      this.setState({boxesTicked: this.state.boxesTicked-1})
    }
  }
  currentCampaignSalaryType(salary_type, salary){
    switch(salary_type){
      case "PER_ANNUM":
        return `£ ${salary} ${this.context.t('per annum')}`
      case "PER_WEEK":
        return `£ ${salary} ${this.context.t('per week')}`
      case "PER_DAY":
        return `£ ${salary} ${this.context.t('per day')}`
      case "PER_HOUR":
        return `£ ${salary} ${this.context.t('per hour')}`
      default:
        return "error in salary_type OR salary"
    }
  }

  createDuration(campaignLat, campaignLng, i){
    let resultDuration
    let DurationService = new google.maps.DistanceMatrixService();
    DurationService.getDistanceMatrix({
        origins: [this.props.userMarker.position],
        destinations: [{lat: campaignLat, lng: campaignLng}],
        travelMode: 'DRIVING',
        avoidHighways: false,
        avoidTolls: false,
      }, (result, status) => {
        if(result && result.rows[0].elements[0].status == "ZERO_RESULTS"){
          if(this.state[`distance${i}`] && this.state[`distance${i}`] !== " ___________"){
            return this.setState({    // prevState?
              [`distance${i}`]: " ___________"
            })
          }
        }
        if(result && result.rows[0].elements[0].distance){
          resultDuration = result.rows[0].elements[0].distance.text
          if(this.state[`distance${i}`] !== resultDuration)
          this.setState({    // prevState?
            [`distance${i}`]: resultDuration
          })
        }
    })
  }
  handleWhichJobType(job_type){
    switch(job_type){
      case 'TEMPORARY':
        return this.context.t('Temporary')
      case 'FULL_TIME':
        return this.context.t('Full-time')
    }
  }
  render(){
    const tickButtonStyle = {
      float: "right",
    }
    const cardStyle = {
      marginTop: "20px",
    }
    let cardHeaderStyle = {}
    if(this.props.width > 900){
      cardHeaderStyle = {
        height: "160px", textAlign: "left"
      }
    }else{
      cardHeaderStyle = {
        height: "180px", textAlign: "left"
      }
    }



    return(
      <div style={{margin: '2px', marginBottom: '55px'}}>
        {this.props.allCampaigns && this.props.companies ? this.props.allCampaigns.map((campaign, i) => {
          console.log(campaign)
          this.createDuration(parseFloat(campaign.lat), parseFloat(campaign.lng), i)
          return(
            <div>
            <div style={tickButtonStyle}>
              <FieldArray
                name="jobs_selected"
                component={CheckboxComponent}
                jobSelected={{campaign_id: campaign.campaign_id, company_id: campaign.company_id, position_id: campaign.job_id}}
                countBoxesTicked={this.countBoxesTicked}
                boxesTicked={this.state.boxesTicked}
              />
            </div>
            <Card style={cardStyle}>
              <CardHeader
                style={cardHeaderStyle}
                actAsExpander={true}
                showExpandableButton={true}
                iconStyle={{position: "relative", left: "12px"}}
              >
                <p style={{fontSize: "18px", margin: "-10px", marginTop: "-30px", padding: "0", color: '#00BCD4'}}>
                <b>{this.context.t('Ref number: ')}{campaign.campaign_id}
                </b>
                </p>

                {this.props.width > 900 
                  ?
                  <p style={{fontSize: '18px', margin: "-10px", marginTop: "10px", padding: "0"}}>{campaign.campaign_name}</p>
                  :
                  <div>
                    <p style={{fontSize: '18px', margin: "-10px", marginTop: "10px", padding: "0"}}>{campaign.campaign_name.substring(0,30)}</p>
                    <p style={{fontSize: '18px', margin: "-10px", marginTop: "10px", padding: "0"}}>{campaign.campaign_name.substring(30)}</p>
                  </div>
                }

                <p style={{fontSize: "15px", margin: "-10px", marginTop: "10px", padding: "0", color: "grey"}}>{campaign.location}</p>
                <p style={{fontSize: "15px", margin: "-10px", marginTop: "10px", padding: "0", color: "grey"}}>{this.handleWhichJobType(campaign.job_type)}</p>
                <p style={{fontSize: "15px", margin: "-10px", marginTop: "10px", padding: "0", color: "grey"}}>{this.currentCampaignSalaryType(campaign.salary_type, campaign.salary)}</p>
                <p style={{fontSize: "15px", margin: "-10px", marginTop: "10px", padding: "0", color: "grey"}}>{`${this.context.t('Starting on')} ${campaign.job_start_date}`}</p>
                <p style={{fontSize: "15px", margin: "-10px",
                  marginTop: "26px", padding: "0",
                  color: "grey"}}>{this.context.t('Distance:')} {this.state[`distance${i}`] ? 
                  this.state[`distance${i}`] + ' ' + this.context.t("away") : 
                  this.context.t('Enter your location')}</p>
              </CardHeader>

              <CardText expandable={true} style={{padding: '5px', textAlign: 'left', borderTop: '1px solid rgb(204,204,204)', overflow: 'hidden'}}>
                  
                  {ReactHtmlParser(campaign.job_description)}

              </CardText>
            </Card>
          </div>
        )
        })
        :
        <div style={{paddingTop: 'calc(50% - 140px)'}}>
          <CircularProgress color="black" size={80}  thickness={7}/>
        </div>
      }
      </div>
    )
  }
}


function mapStateToProps(state) {
  return {
    companies: state.jobseeker.companies,
    allCampaigns: state.jobseeker.allCampaigns,
  };
}

CardExampleExpandable.contextTypes = {
  t: PropTypes.func.isRequired
}

export default reduxForm({
  form: 'wizard',  // <------ same form name
  destroyOnUnmount: false, // <------ preserve form data
  forceUnregisterOnUnmount: true, // <------ unregister fields on unmount
})(
  connect(mapStateToProps, { fetchCompanies, fetchAllCampaigns })(
    connect(state => ({
      lang: state.i18nState.lang
    }))(CardExampleExpandable)
  )
)
