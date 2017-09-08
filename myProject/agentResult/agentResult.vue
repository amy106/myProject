<template>
    <div class="bodyBox">
        <!-- <header v-if="noAgent" class="isHeader">
            <h1>发布成功</h1>
        </header> -->
        <div class="itemBox matchingBox" v-if="listLength">
            <div class="title">推荐经纪人</div>
            <div class="des">他们将在30分钟内联系您，请耐心等待...</div>
            <ul :class="{androidClass:android}">
                <li :class="item.statusClass" v-for="(item,index) in agentList">
                        <div class="agentHeadImg" v-bind:style="'backgroundImage:url('+item.avator+')'" style="backgroundSize:cover;backgroundPosition:center center;"></div>
                        <div class="msgWrap">
                            <div class="msg">
                                <div class="user">
                                    <span class="user_name">{{item.realname}}</span>
                                    <i id="matchingi">{{item.company}}</i>
                                    <!-- <div class="monthVolume">
                                        月成交
                                        <span>{{item.stars}}</span>
                                    </div> -->
                                </div>
                                <div class="status">{{item.statusText}}</div>
                            </div>
                            <!-- status=经纪人当前的订单状态，1：待接单，2：已接单，3：委托成功，4：委托失败，5：已拒绝，6：已过期；四期前的旧数据没有该属性，返回空字符串（四期新增） -->
                            <!-- status=1，2，3时可以打电话 -->
                            <a v-if="orderType==2 && item.status<4" class="matchingPhoneIcon" @touchstart="getVirtualNum(item,$event),$jumpLog('','dianhua','zfwtzj','',this.areaLog)"></a>
                            <a v-if="orderType==3 && item.status<4" class="matchingPhoneIcon" @touchstart="getVirtualNum(item,$event),$jumpLog('','dianhua','zfwtdk','',this.areaLog)"></a>

                            <!-- 其他的不可以打电话 -->
                            <a v-if="orderType==2 && item.status>3" class="matchingPhoneIcon"></a>
                            <a v-if="orderType==3 && item.status>3" class="matchingPhoneIcon"></a>
                        </div>
                </li>
            </ul>
            <div class="bottom" v-if="listLength>10">已经到底啦</div>
        </div>
        <div v-if="listLength==0 && noAgent" class="noAgent">
            <span></span>
            <h1>暂没有匹配到合适的经纪人</h1>
            <h2>小客服正快马加鞭地赶来联系您，请稍等</h2>
            <!-- <a v-if="orderType==2 || orderType==3" @click="$jumpLog('','lianxikefu','zfwtkong','')" href="tel:18510788233">直接联系客服</a> -->
            <a v-if="orderType==2 || orderType==3" @click="toPosting()">试试发布房源</a>
        </div>
        <div class="virtualTip"  v-if="listLength>0 && iKnowFlag">
            <div class="mask"></div>
            <div class="tipWrap animated bounceInDown">
                <img class="topImg" width="100%"  src="./images/virtual.png" />
                <div>
                    <p class="title">对方将通过“虚拟号”联系您请您注意接听哦</p>
                    <p class="msg">您的真实手机号已隐藏，对方无法看到</p>
                    <p class="btn"  @click="iKnow()">我知道了</p>
                </div>
            </div>
        </div>
    </div>
</template>
<!-- end -->

<script>
    import './agentResult.less';
    import { parallel } from 'async';
    export default {
        data(){
            return {
                imgObj:{
                    user:require('./images/user.png')
                },
                listLength:0,
                noAgent:false,
                agentList:[],
                villageName:this.$getParameter('cell'),
                orderId:this.$getParameter('orderId'),
                orderType:Number(this.$getParameter('orderType')),//用于在联系客服时候埋点的不同，带客/中介异常提示页面
                iKnowFlag: localStorage.iKnowFlag == 1 ? false : true ,//用于是否出现虚拟号码的提示框
                areaLog:this.$getParameter('cityID') ? this.$getParameter('cityID') : undefined, //获取area
            }
        },
        computed: {//属性计算
            android(){
                var u = navigator.userAgent;
                return u.indexOf('Android') > -1 || u.indexOf('Adr') > -1;
            }
        },
        methods:{
            pullData(cb){
                this.villageName=decodeURIComponent(this.villageName);
                this.$request('getAgentList', {
                    cell : decodeURIComponent(this.villageName),//小区名称
                    orderid : this.orderId//委托成功后的订单号
                }, cb);

            },
            processData(res){
                let _this=this;
                if(res.code == 0){
                    this.agentList=res.data;
                    for(var i=0;i<this.agentList.length;i++){
                        if(this.agentList[i].statusText=='待接单'){
                            this.agentList[i].statusClass='waiting';
                        }
                        else if(this.agentList[i].statusText=='已接单' || this.agentList[i].statusText=='委托成功'){
                            this.agentList[i].statusClass='success';
                        }
                        else{
                            this.agentList[i].statusClass='close';
                        }
                    }
                    this.listLength=this.agentList.length;
                    if(this.listLength){
                        this.noAgent=false;
                        this.orderType==2 ? this.$appShowLog('zfwtzj',this.areaLog):this.$appShowLog('zfwtdk',this.areaLog);
                    }else{
                        this.noAgent=true;
                        this.$jumpLog('','show','zfwtkong','',_this.areaLog);
                    }
                }else{
                    this.noAgent=true;
                    this.$jumpLog('','show','zfwtkong','',_this.areaLog);
                }
            },
            //房东主动点击电话生成密号
            getVirtualNum(item,event){
                this.$request('relationByBrokerid', {
                    brokerid : item.userid,
                    orderid : this.orderId
                }, function(a,res){
                    $(event.target).attr('href','tel:'+res.data);
                    $(event.target).click(); 
                })
            },
            iKnow(){
                this.iKnowFlag=false;
                localStorage.iKnowFlag = 1;
            },
            getCookie(c_name){
                if (document.cookie.length > 0) {
                    var c_start = document.cookie.indexOf(c_name + "=");
                    if (c_start != -1) {
                        c_start = c_start + c_name.length + 1
                        var c_end = document.cookie.indexOf(";", c_start)
                        if (c_end == -1) c_end = document.cookie.length
                        return unescape(document.cookie.substring(c_start, c_end))
                    }
                }
                return ""
            },
            toPosting(){
                let _this=this;
                var localid=1;
                if(_this.getCookie('cid')){
                    _this.getCookie('cid').replace(/\d+/g, function () {
                        localid=parseInt(arguments[0]);
                    });
                }
                _this.$jumpLog('','publish','zfwtkong','',_this.areaLog);
                let url=window.location.protocol +"//pwebapp.58.com/fang/"+localid+"/8/s5/"
                WBAPP._nativeBridge({
                    action: 'pagetrans',
                    tradeline: 'core',
                    content: {
                        pagetype: 'link',
                        url: url,
                        title: '整租发布',
                        list_name: 'zufang',
                        categoryid: '8',
                        loadingtype: '2',
                        isfinish: 'true'
                    }
                })
            }
        },
        mounted(){//dom渲染完成之后调用
            let _this=this;
            _this.$app.extendRightBtn('top_right','我的委托',function(){
               _this.$app.loadPage('link', '//houserent.m.58.com/landlordentrust/My_entrust/','我的委托');
            });
        }
    };
</script>