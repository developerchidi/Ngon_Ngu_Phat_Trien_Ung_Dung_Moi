LoadData();

async function debugDatabase() {
    try {
        const data = await fetch('http://localhost:3000/posts');
        const posts = await data.json();
        console.log('All posts:', posts);
        console.log('Active posts:', posts.filter(post => !post.isDelete));
        console.log('Deleted posts:', posts.filter(post => post.isDelete));
    } catch (error) {
        console.error('Debug error:', error);
    }
}

//GET: domain:port//posts
//GET: domain:port/posts/id
async function LoadData() {
    try {
        const data = await fetch('http://localhost:3000/posts');
        const posts = await data.json();
        const activePosts = posts.filter(post => !post.isDelete);
        for (const post of activePosts) {
            let body = document.getElementById("body");
            body.innerHTML += convertDataToHTML(post);
        }
    } catch (error) {
        console.error('Error loading data:', error);
    }
}
async function LoadDataA() {
    try {
        const data = await fetch('http://localhost:3000/posts');
        const posts = await data.json();
        const activePosts = posts.filter(post => !post.isDelete);
        for (const post of activePosts) {
            let body = document.getElementById("body");
            body.innerHTML += convertDataToHTML(post);
        }
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

function convertDataToHTML(post) {
    let result = "<tr>";
    result += "<td>" + post.id + "</td>";
    result += "<td>" + post.title + "</td>";
    result += "<td>" + post.views + "</td>";
    result += "<td><input type='submit' value='Delete' onclick='Delete("+post.id+")'></input></td>";
    result += "</tr>";
    return result;
}

async function getNextId() {
    try {
        const data = await fetch('http://localhost:3000/posts');
        const posts = await data.json();
        if (posts.length === 0) return "1";
        const maxId = Math.max(...posts.map(post => parseInt(post.id)));
        return (maxId + 1).toString();
    } catch (error) {
        console.error('Error getting next ID:', error);
        return "1";
    }
}



//POST: domain:port//posts + body
async function SaveData(){
    try {
        let id = document.getElementById("id").value;
        let title = document.getElementById("title").value;
        let view = document.getElementById("view").value;
        
        if(id && id.trim() !== '') {
            const checkResponse = await fetch("http://localhost:3000/posts/"+id);
            
            if(checkResponse.ok){
                let dataObj = {
                    title:title,
                    views:view,
                    isDelete: false
                }
                const updateResponse = await fetch('http://localhost:3000/posts/'+id, {
                    method:'PUT',
                    body:JSON.stringify(dataObj),
                    headers:{
                        "Content-Type":"application/json"
                    }
                });
                console.log('Update response:', updateResponse);
            } else {
                const nextId = await getNextId();
                let dataObj = {
                    id: nextId,
                    title:title,
                    views:view,
                    isDelete: false
                }
                const createResponse = await fetch('http://localhost:3000/posts', {
                    method:'POST',
                    body:JSON.stringify(dataObj),
                    headers:{
                        "Content-Type":"application/json"
                    }
                });
                console.log('Create response:', createResponse);
            }
        } else {
            const nextId = await getNextId();
            let dataObj = {
                id: nextId,
                title:title,
                views:view,
                isDelete: false
            }
            const createResponse = await fetch('http://localhost:3000/posts', {
                method:'POST',
                body:JSON.stringify(dataObj),
                headers:{
                    "Content-Type":"application/json"
                }
            });
            console.log('Create response:', createResponse);
        }
        
        document.getElementById("body").innerHTML = "";
        LoadData();
        
    } catch (error) {
        console.error('Error saving data:', error);
    }
}
//PUT: domain:port//posts/id + body

//DELETE: domain:port//posts/id (Soft Delete)
async function Delete(id){
    try {
        const getResponse = await fetch('http://localhost:3000/posts/'+id);
        if (!getResponse.ok) {
            console.error('Post not found');
            return;
        }
        
        const post = await getResponse.json();
        
        const updateData = {
            ...post,
            isDelete: true
        };
        
        const response = await fetch('http://localhost:3000/posts/'+id, {
            method:'PUT',
            body: JSON.stringify(updateData),
            headers: {
                "Content-Type": "application/json"
            }
        });
        
        if (response.ok) {
            console.log("Soft delete thanh cong");
            const rows = document.querySelectorAll('#body tr');
            rows.forEach(row => {
                const firstCell = row.querySelector('td');
                if (firstCell && firstCell.textContent.trim() === id.toString()) {
                    row.remove();
                }
            });
        }
    } catch (error) {
        console.error('Error deleting data:', error);
    }
}