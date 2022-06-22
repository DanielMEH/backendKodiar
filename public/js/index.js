

     let dataItems = []

const dataProductItems = async ()=>{

    const data = await productData()

    dataItems = data.data;
    dataList(dataList)

}

async function productData(){

    let response = await fetch("http://localhost:3000/buscador")
    let data = await response.json()
    console.log(data)


}

const user = uset => uset.ma


const dataList = (dataList)=>{

    
}

