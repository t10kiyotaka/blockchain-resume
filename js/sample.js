<script>
//接続するJSON-RPCサーバのIPアドレスおよびポート番号
var url = "http://localhost:18545";
var user_name;
var web3 = new Web3();
var provider = new web3.providers.HttpProvider(url);
web3.setProvider(provider);
web3.eth.defaultAccount = web3.eth.accounts[0];
var ABI = [{"constant":false,"inputs":[],"name":"countUp","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"getCompanyName","outputs":[{"name":"company","type":"bytes32"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"getCounterName","outputs":[{"name":"name","type":"bytes32"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"getNumberOfCounter","outputs":[{"name":"number","type":"uint32"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"company","type":"bytes32"}],"name":"setCompany","outputs":[],"payable":false,"type":"function"},{"inputs":[{"name":"name","type":"bytes32"}],"payable":false,"type":"constructor"}]
var masterABI = [{"constant":true,"inputs":[],"name":"getCounterAddressList","outputs":[{"name":"counterAddressList","type":"address[]"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"name","type":"bytes32"}],"name":"addCounter","outputs":[],"payable":false,"type":"function"}]
//接続するContract(CounterMaster)のアドレス
var master = web3.eth.contract(masterABI).at("0x6fff039c8132a92de8f50440300860f4a1e4b365");
var CounterAddressList = master.getCounterAddressList();

//ログイン(アンロック)
function login() {
    user_name = $("#userName").val();
    var password = $("#password").val();
    var JSONdata = createJSONdata("personal_unlockAccount", [ user_name, password, 3000 ]);
    
    executeJsonRpc(url, JSONdata, function success(data) {
        //ログイン成功
        if (data.error == null) {
            console.log("login success!");
        } else {
            //ログインエラー
            console.log("login error");
        }
        init();
    }, function error(data) {
        //ログインエラー
        console.log("login error");
    });
}

//初期処理
function init() {
    web3.eth.defaultAccount = user_name;
    var table = document.getElementById('list');
    //JSからクリエイトしたContractのアドレスをコンソールログ
    console.log(CounterAddressList);
    for (var i = 0; i < CounterAddressList.length; i++) {
        // 対象の候補者コントラクトの取得
        var Counter = web3.eth.contract(ABI).at(CounterAddressList[i]);
        //### HTML編集 table行の追加、編集 ここから ###
        var row = table.insertRow();
        var td = row.insertCell(0);
        var radioButton1 = document.createElement('input');
        radioButton1.type = 'radio';
        radioButton1.name = 'CounterAddress';
        radioButton1.value = CounterAddressList[i];
        td.appendChild(radioButton1);
        td = row.insertCell(1);
        td.innerHTML = web3.toAscii(Counter.getCounterName());
        td = row.insertCell(2);
        td.innerHTML = Counter.getNumberOfCounter();
        //★企業名列追加
        td = row.insertCell(3);
        var inputText1 = document.createElement('input');
        inputText1.type = 'text';
        inputText1.placeholder = "企業名を入力";
        inputText1.id = "company";
        td.appendChild(inputText1);
        td = row.insertCell(4);
        td.innerHTML = decodeURI(web3.toAscii(Counter.getCompanyName()));
        //### HTML編集 table行の追加、編集 ここまで ###
    }
}

//更新
function refresh() {
    web3.eth.defaultAccount = user_name;
    //### HTML編集 table行の削除 ここから ###
    var table = document.getElementById('list');
    for (var i = CounterAddressList.length; i > 0; i--) {
        table.deleteRow(i);
    }
    //### HTML編集 table行の削除 ここまで ###
    init();
}

//カウントアップ
function countUp() {
    web3.eth.defaultAccount = user_name;
    var targetAddress;
    
    //ラジオボタンを指定
    var CounterList = document.getElementsByName("CounterAddress");
    for (i = 0; i < CounterList.length; i++) {
        if (CounterList[i].checked) {
            // 対象の候補者コントラクトアドレスを取得
            targetAddress = CounterList[i].value;
        }
    }
    // 対象候補者コントラクトを取得
    var Counter = web3.eth.contract(ABI).at(targetAddress);
    // 対象候補者に投票
    console.log(targetAddress);
    Counter.countUp();
    //対象者の企業を登録
    var company = web3.fromAscii(encodeURI($("#company").val()),32);
    Counter.setCompany(company);
}

//JSONメッセージ生成
function createJSONdata(method, params) {
var JSONdata = {
    "jsonrpc" : "2.0",
    "method" : method,
    "params" : params
    };
    return JSONdata;
}

//JSON-RPC実行
function executeJsonRpc(url_exec, JSONdata, success, error) {
    $.ajax({
        type : 'post',
        url : url_exec,
        data : JSON.stringify(JSONdata),
        contentType : 'application/JSON',
        dataType : 'JSON',
        scriptCharset : 'utf-8',
        success : function(data) {
            success(data);
        },
        error : function(data) {
            error(data);
        }
    });
}
    
</script>