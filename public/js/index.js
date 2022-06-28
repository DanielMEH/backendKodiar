const input =document.querySelector("#searchInput")
const usersList = document.getElementById("users")

let users = []

window.addEventListener("DOMContentLoaded",async()=>{

    usersList.innerHTML="<h1>Loading...</h1>"
   const data = await loadUsers()
    users = data.data
    console.log(users)
   renderData(users)

})

 async function loadUsers(){

   const response = await fetch('http://localhost:3000/buscador');
   return await response.json();

}

input.addEventListener("keyup",(event)=>{

   const newUser = users.filter(user => `${user.namep.toLowerCase()} 
   ${user.namep.toLowerCase()}`.includes(event.target.value.toLowerCase()))
   renderData(newUser)
})

const usersItems = users => users.map(user =>
    
`<li class="listKodiart">

 <div class="items">
 <span class="xfc" >Codigo: ${user.id}</span>
 <span class="xfc" >Nombre: ${user.namep}</span>
 <span class="xfc" >Unidades: ${user.unidades}</span>
 <span class="xfc" >Precio ${user.precioc}</span>
 </li> </li>`).join(" ")


function renderData(users){

  const itemsString =  usersItems(users)
  usersList.innerHTML= itemsString


}

// async function productData(){

//     let response = await fetch("http://localhost:3000/buscador")
//     let data = await response.json()
//     console.log(data)


// }


