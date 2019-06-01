import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Button, Modal, Input, Icon, Upload } from 'antd';
import cav from '../klaytn/caver';
import contractJson from '../../build/contracts/DodoRepository.json';

@inject('auth')
@observer
class ProofSubmitStatus extends Component {
  
  constructor(props) {
    super(props);
    this.state = { visible: false, title: "", imageUrl: "", thumbUrl: "", proceeding: false };
  }

  openModal = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const monthStr = month < 10 ? `0${month}` : `${month}`;
    const date = today.getDate();
    const dateStr = date < 10 ? `0${date}` : `${date}`;
    this.setState({
      visible: true,
      title: `${year}-${monthStr}-${dateStr}`,
    });
  }
  
  submitFinalize = async e => {
    const projectNo = this.props.projectNo * 1;
    const contract = new cav.klay.Contract(contractJson.abi, contractJson.networks["1001"].address);
    const gasAmount = await contract.methods.finalizeProject(projectNo).estimateGas({ 
      from: this.props.auth.values.address,
    });

    contract.methods.finalizeProject(projectNo).send({ 
      from: this.props.auth.values.address,
      gas: gasAmount
    }).on('transactionHash', (hash) => {
      console.log(hash);
    })
    .on('receipt', (receipt) => {
      console.log(receipt);
      this.props.auth.openPage("2");
      this.props.auth.openPage("1");
    })
    .on('error', err => {
      alert(err.message);
    });
  }

  handleOk = async e => {
    if(this.state.title.length * this.state.imageUrl.length * this.state.thumbUrl.length !== 0) {
      this.setState({
        proceeding: true
      });
      try {
        const data = {
          i: this.state.imageUrl, t: this.state.thumbUrl,
        }
        const memo = JSON.stringify(data);
        const projectNo = this.props.projectNo * 1;
        const contract = new cav.klay.Contract(contractJson.abi, contractJson.networks["1001"].address);
        const gasAmount = await contract.methods.submitProof(projectNo,
          this.state.title,
          memo
        ).estimateGas({ 
          from: this.props.auth.values.address,
        });

        contract.methods.submitProof(projectNo,
          this.state.title,
          memo
        ).send({ 
          from: this.props.auth.values.address,
          gas: gasAmount
        }).on('transactionHash', (hash) => {
          console.log(hash);
        })
        .on('receipt', (receipt) => {
          console.log(receipt);
          this.setState({
            visible: false,
            title: "",
            imageUrl: "",
            thumbUrl: "",
            proceeding: false,
          });
          this.props.auth.openPage("2");
          this.props.auth.openPage("1");
        })
        .on('error', err => {
          alert(err.message);
          this.setState({
            proceeding: false,
          });
        });
      } catch (e) {
        this.setState({
          proceeding: false,
        });
        alert(e.message);
        return;
      }
    } else {
      alert("You should upload image or write title");
    }

  };

  handleCancel = e => {
    this.setState({
      visible: false,
      title: "",
      imageUrl: "",
      thumbUrl: "",
    });
  }

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  };

  handleImageChange = info => {
    if (info.file.status === 'uploading') {
      this.setState({ loading: true });
      return;
    }
    if (info.file.status === 'done') {
      this.setState({
        imageUrl: info.file.response.data.display_url,
        thumbUrl: info.file.response.data.thumb.url,
        loading: false,
      });
    } 
    if (info.file.status === 'error') {
      alert('Error occurred while uploading image.')
    }
  }

  makeData = (file) => {
    return {
      key: "b4a4e120584d9dec88dd58d748d88f29",
      image: file,
    };
  }

  render() {
    if(this.props.status.active === false) {
      if(this.props.status.success === true) {
        return (
          <div style={{ fontSize: "30px", fontWeight: "lighter", color: "#343434" }}>
            <Button
              style={{ width: "130px", height: "40px", fontSize: "14px", fontWeight: "lighter", backgroundColor: "#ffffff", color: "#2f54eb" }}
              disabled
              type="dashed"
            >
              Success
            </Button>
          </div>  
        );
      } else {
        return (
          <div style={{ fontSize: "30px", fontWeight: "lighter", color: "#343434" }}>
            <Button
              style={{ width: "130px", height: "40px", fontSize: "14px", fontWeight: "lighter", backgroundColor: "#ffffff", color: "#eb2f2f" }}
              disabled
              type="dashed"
            >
              Fail
            </Button>
          </div>    
        );
      }
    }
    const date = Math.floor(new Date().getTime() / 1000);
    if(date > this.props.info.endDate * 1 + (this.props.status.claimed * 1 + 1) * 3600 * 24 * 2) {
      return (
        <div>
          <Button
            style={{ width: "130px", height: "40px", fontSize: "14px", fontWeight: "lighter", color: "white", backgroundColor: "#1890ff" }}
            onClick={this.submitFinalize}
          >
            Finalize
          </Button>
        </div>
      );
    }
    if(date > this.props.info.endDate * 1) {
      return (
        <div style={{ fontSize: "30px", fontWeight: "lighter", color: "#343434" }}>
          <Button
            style={{ width: "130px", height: "40px", fontSize: "14px", fontWeight: "lighter", backgroundColor: "#ffffff", color: "#343434" }}
            disabled
            type="dashed"
          >
            Waiting
          </Button>
        </div>  
      );
    }
    if(date < this.props.info.startDate * 1) {
      return (
        <div style={{ fontSize: "30px", fontWeight: "lighter", color: "#343434" }}>
          <Button
            style={{ width: "130px", height: "40px", fontSize: "14px", fontWeight: "lighter", backgroundColor: "#ffffff", color: "#343434" }}
            disabled
            type="dashed"
          >
            Waiting
          </Button>
        </div>   
      );
    }
    const today = new Date();
    const timestampDate = new Date(this.props.timestamp * 1000);

    if(today.getYear() === timestampDate.getYear() 
      && today.getMonth() === timestampDate.getMonth() 
      && today.getDate() === timestampDate.getDate()) {
      return (
        <div style={{ fontSize: "30px", fontWeight: "lighter", color: "#343434" }}>
          <Button
            style={{ width: "130px", height: "40px", fontSize: "14px", fontWeight: "lighter", backgroundColor: "#ffffff", color: "#343434" }}
            disabled
            type="dashed"
          >
            Complete
          </Button>
        </div>  
      );
    }

    const uploadButton = (
      <div>
        <Icon type={this.state.loading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">Upload</div>
      </div>
    );
    const imageUrl = this.state.thumbUrl;
    return (
      <div>
        <Button
          style={{ width: "130px", height: "40px", fontSize: "14px", fontWeight: "lighter", color: "white", backgroundColor: "#1890ff" }}
          onClick={this.openModal}
        >
          Prove it
        </Button>
        <Modal
          title="Submit Proof"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          okText="Submit"
          cancelText="Cancel"
          okButtonProps={{ loading: this.state.proceeding }}
        >
          <Upload
            name="image"
            listType="picture-card"
            className="avatar-uploader"
            showUploadList={false}
            onChange={this.handleImageChange}
            action="https://api.imgbb.com/1/upload"
            data={this.makeData}
          >
            {imageUrl ? <img src={imageUrl} alt="avatar" /> : uploadButton}
          </Upload>
          <div>Title</div>
          <Input
            name="title"
            value={this.state.title}
            margin="normal"
            variant="outlined"
            onChange={this.handleChange('title')}
          >
          </Input>
        </Modal>
      </div>
    );
  }

}

export default ProofSubmitStatus;