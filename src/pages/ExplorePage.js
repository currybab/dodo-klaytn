import React from "react";
import { observer, inject } from 'mobx-react';
import { Card, Button } from 'antd';
import NoLoginHome from '../components/NoLoginHome';
import LoginHome from '../components/LoginHome';
import cav from '../klaytn/caver';
import contractJson from '../../build/contracts/DodoRepository.json';
import ProofCard from '../components/ProofCard';

@inject('auth')
@observer
class ExplorePage extends React.Component {
  state = {
    items: [],
    index: 0,
    visible: false,
  };
  proofCount = 0;

  fetchMoreData = async () => {
    const contract = new cav.klay.Contract(contractJson.abi, contractJson.networks["1001"].address);
    const newProofs = [];
    for(let i = this.proofCount - 1 - this.state.items.length; i >= 0; i -= 1) {
      const proof = await contract.methods.getProof(i).call();
      proof.proofNo = i;
      newProofs.push(proof);
      // console.log(proof);
      if(newProofs.length === 6) break;
    }
    if(newProofs.length === 0) return;
    this.setState({
      items: this.state.items.concat(newProofs)
    });
    window.addEventListener("scroll", this.infiniteScroll, true);
  };

  onClickButton = (index) => {
    this.setState({
      visible: true,
      index
    })
  }

  infiniteScroll = async () => {
    const scrollHeight = document.querySelector("main").scrollHeight
    const scrollTop = document.querySelector("main").scrollTop;
    const clientHeight = document.querySelector("main").clientHeight;

    if(scrollTop + clientHeight === scrollHeight) {
      window.removeEventListener("scroll", this.infiniteScroll, true);
      this.fetchMoreData();
    }
  }

  async componentDidMount() {
    const contract = new cav.klay.Contract(contractJson.abi, contractJson.networks["1001"].address);
    const proofCount = await contract.methods.getAllProofsCount().call();
    this.proofCount = proofCount;
    this.fetchMoreData();
  }

  handleOk = async e => {
    const like = this.state.items[this.state.index].like;
    const dislike = this.state.items[this.state.index].dislike;
    const address = this.props.auth.values.address;
    if(like.includes(address) || dislike.includes(address)) {
      alert("you already voted!");
      return;
    }
    try {
      const contract = new cav.klay.Contract(contractJson.abi, contractJson.networks["1001"].address);
      const gasAmount = await contract.methods.likeProof(this.state.items[this.state.index].proofNo).estimateGas({ 
        from: address
      });
      contract.methods.likeProof(this.state.items[this.state.index].proofNo).send({ 
        from: address,
        gas: gasAmount
      }).on('transactionHash', (hash) => {
        console.log(hash);
      })
      .on('receipt', (receipt) => {
        console.log(receipt);
        this.setState({
          visible: false,
        });
        this.props.auth.openPage(1);
      })
      .on('error', err => {
        alert(err.message);
        this.setState({
          visible: false,
        });
      });
    } catch (e) {
      return;
    }
  }

  handleCancel = async e => {
    if(e.target.className === "ant-btn ant-btn-danger") {
      const like = this.state.items[this.state.index].like;
      const dislike = this.state.items[this.state.index].dislike;
      const address = this.props.auth.values.address;
      if(like.includes(address) || dislike.includes(address)) {
        alert("you already voted!");
        return;
      }
      try {
        const contract = new cav.klay.Contract(contractJson.abi, contractJson.networks["1001"].address);
        const gasAmount = await contract.methods.dislikeProof(this.state.items[this.state.index].proofNo).estimateGas({ 
          from: this.props.auth.values.address
        });
        contract.methods.dislikeProof(this.state.items[this.state.index].proofNo).send({ 
          from: this.props.auth.values.address,
          gas: gasAmount
        }).on('transactionHash', (hash) => {
          console.log(hash);
        })
        .on('receipt', (receipt) => {
          console.log(receipt);
          this.setState({
            visible: false,
          });
          this.props.auth.openPage(1);
        })
        .on('error', err => {
          alert(err.message);
          this.setState({
            visible: false,
          });
        });
      } catch (e) {
        alert(e.message);
        this.setState({
          visible: false,
        });
        return;
      }
    } else {
      this.setState({
        visible: false,
      });
      return;
    }
  }

  render() {
    const { Meta } = Card;
    const { isLoggedIn } = this.props.auth.values;
    return (
      <div style={{backgroundColor: "#ffffff"}}>
        {
          isLoggedIn ? <LoginHome /> : <NoLoginHome />
        }
        <h2 style={{ textAlign: "center", marginTop: "100px"}}>다른 사람의 Life</h2>
        <div
          className="ExplorePage-InfiniteScroll"
          style={{ display: "flex", maxWidth: "1300px", minWidth: "375px", margin: "10px auto", width: "70%", justifyContent: "space-between", listStyle: "none", flexFlow: "row wrap", padding: "0" }}
        >
          {
            this.state.items.map((item, index) => (
              <Card
                style={{ width: "360px", height: "360px", margin: "30px auto" }}
                cover={<img alt="proof" src={JSON.parse(item.memo).t} />}
              > 
                <Button 
                  style={{
                    height: "90px", fontSize: "30px", position: "absolute", 
                    top: "240px", left: "30px", width: "300px" 
                  }}
                  onClick={() => this.onClickButton(index)}
                >
                  내역 보기
                </Button>
              </Card>
            ))
          }
        </div>
        <ProofCard 
          handleOk={this.handleOk}
          handleCancel={this.handleCancel}
          visible={this.state.visible}
          proof={ this.state.items.length > this.state.index ? this.state.items[this.state.index] : null }
        />
      </div>
    );
  }
}

export default ExplorePage;
