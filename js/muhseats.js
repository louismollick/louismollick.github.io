/* 
FULL CREDIT to Jennings Zhang, the meemer himself, for figuring out VSB
https://gitlab.com/snippets/1786103

check him out
https://jennydaman.gitlab.io/
*/


/*********************** UI FUNCTIONS ***********************/

async function addCourseToList(course){
    // Create HTML Element for the Course, row in list, without number of seats
    let list = document.getElementById('course-list');
    let row = document.createElement('tr');
    let termtxt = document.getElementById('term').options[document.getElementById('term').selectedIndex].text;
    row.innerHTML =
    `
        <td>${termtxt}</td>
        <td>${course.code}</td>
        <td>${course.crn}</td>
        <td id="seats">
            <div class="spinner-border" role="status" style="width: 1.7rem; height: 1.7rem;">
                <span class="sr-only">Loading...</span>
            </div>
        </td>
        <td><a href='#' class="btn btn-danger btn-sm delete">X</a></td>
    `;
    list.appendChild(row); 

    // Make promise to return number of seats
    let seats = await new Promise((resolve,reject) =>{
        let url = `https://vsb.mcgill.ca/vsb/getclassdata.jsp?term=${course.term}&course_0_0=${course.code}&rq_0_0=null${this.nWindow()}&nouser=1`;
        let xhr = new XMLHttpRequest();
        xhr.responseType = 'document';
        xhr.open('GET', 'https://cors-anywhere.herokuapp.com/' + url, true);
        xhr.onload = function () {
            try{
                console.log(xhr.responseXML)
                let xml = xhr.responseXML.getElementsByTagName('classdata')[0].getElementsByTagName('course')[0].getElementsByTagName('uselection');
                for (let i = 0; i < xml.length; i++){
                    let section = xml[i].getElementsByTagName('selection')[0].getElementsByTagName('block');
                    for (let j = 0; j < section.length; j++){
                        if (section[j].getAttribute('cartid') === course.crn){
                            resolve(section[j].getAttribute('os'));
                        }
                    }
                }
            }
            catch{
                resolve("NA");
            }
        }
        xhr.onerror = function () {
            reject("Error with url for vsb");
        };
        xhr.send();
    });

    // Update the seat number once promise is resolved
    row.querySelector('#seats').innerHTML = `${seats}`;


    // Notify if there are seats available
    if (seats > 0){
        if (Notification.permission === "granted"){
            notify(course.code, seats);
        }
        else{
            requestNotify();
            if (Notification.permission === "granted"){
                notify(course.code, seats);
            }
        }
    }
}

function requestNotify(){ // request on DOM load, and if a notify is called and permission isnt granted
    if (!("Notification" in window)) {
        alert("This browser does not support system notifications. Please use Chrome or Firefox instead.");
    }
    else if (Notification.permission !== 'denied') {
        Notification.requestPermission();
    }
}

function notify(code, seats) {
    let notification = new Notification(`${seats} seats for ${code}!`, {
        icon: '/images/omgcat.jpg',
        body: 'Click me to go to Minerva!',
        requireInteraction: true,
    });
    notification.onclick = function () {
        window.open("https://horizon.mcgill.ca");      
    };
}

function nWindow() { //weird useless security attempt to get url for vsb
    var f8b0=["\x26\x74\x3D","\x26\x65\x3D"];
    var t=(Math.floor((new Date())/60000))%1000;
    var e=t%3+t%19+t%42;
    return f8b0[0]+t+f8b0[1]+e;
}

function handleAutoCheck(){ 
    // If auto refresh selected, start refreshing periodically
    if (document.getElementById('auto').checked) {
        timeOut = setTimeout("location.reload(true);", 5000);
    }
}

function displayTerms(){
    let el = document.getElementById('term');
    let today = new Date();
    
    el.innerHTML =
    `
        <option value="${today.getFullYear()-1}01">Winter ${today.getFullYear()-1}</option>
        <option value="${today.getFullYear()-1}05">Summer ${today.getFullYear()-1}</option>
        <option value="${today.getFullYear()-1}06">Summer ${today.getFullYear()-1} - Supplementary</option>
        <option value="${today.getFullYear()-1}09">Fall ${today.getFullYear()-1}</option>
        <option value="${today.getFullYear()}01">Winter ${today.getFullYear()}</option>
        <option value="${today.getFullYear()}05">Summer ${today.getFullYear()}</option>
        <option value="${today.getFullYear()}06">Summer ${today.getFullYear()} - Supplementary</option>
        <option value="${today.getFullYear()}09">Fall ${today.getFullYear()}</option>
        <option value="${today.getFullYear()+1}01">Winter ${today.getFullYear()+1}</option>
        <option value="${today.getFullYear()+1}05">Summer ${today.getFullYear()+1}</option>
        <option value="${today.getFullYear()+1}06">Summer ${today.getFullYear()+1} - Supplementary</option>
        <option value="${today.getFullYear()+1}09">Fall ${today.getFullYear()+1}</option>
    `;
    let selterm;
    if (today.getMonth() >= 0 && today.getMonth() < 3 || today.getMonth() === 11){
        selterm = '01';
    } 
    else if (today.getMonth() > 3 && today.getMonth() < 8){
        selterm = '05';
    } 
    else if (today.getMonth() > 7 && today.getMonth() != 11){
        selterm = '09';
    }

    // Select current term
    document.getElementById('term').querySelector(`option[value="${today.getFullYear()}${selterm}"]`).setAttribute("selected", "selected");
}

function displayStoreCourses(){ // Displays Courses from Local Storage
    const courses = getStoredCourses();

    courses.forEach((course) => {
        addCourseToList(course);
    });
}

function displayStoreAutoCheck(){
    const autoCheck = getStoredAutoCheck();

    document.getElementById('auto').checked = autoCheck;
}

function removeCourse(el){
    el.parentElement.parentElement.remove();
}

function showAlert(message, className){
    const div = document.createElement('div');
    div.className = `alert alert-${className}`;
    div.appendChild(document.createTextNode(message));
    const container = document.getElementsByClassName('container')[0];
    const form = document.getElementById('course-form');
    container.insertBefore(div, form);

    // Vanish in 3 seconds
    setTimeout(() => document.getElementsByClassName('alert')[0].remove(), 3000);
}

function clearFields(){
    document.getElementById('term').value = '';
    document.getElementById('facc').value = '';
    document.getElementById('number').value = '';
    document.getElementById('crn').value = '';
}

/*********************** STORAGE FUNCTIONS ***********************/

function getStoredCourses(){
    let courses;
    if (localStorage.getItem('courses') === null){
        courses = [];
    }
    else{
        courses = JSON.parse(localStorage.getItem('courses'));
    }

    return courses;
}

function getStoredAutoCheck(){
    let autoCheck;
    if (localStorage.getItem('autoCheck') === null){
        autoCheck = false;
    }
    else{
        autoCheck = JSON.parse(localStorage.getItem('autoCheck'));
    }

    return autoCheck;
}

function addCourseToStore(course){
    const courses = getStoredCourses();
    courses.push(course);

    localStorage.setItem('courses', JSON.stringify(courses));
}

function removeStoredCourse(crn){
    const courses = getStoredCourses();
    courses.forEach((book, index) => {
        if(book.crn === crn){
            courses.splice(index, 1);
        }
    });
    localStorage.setItem('courses', JSON.stringify(courses));
}

/*********************** EVENTS ***********************/

let timeOut;

// Event: On load
document.addEventListener('DOMContentLoaded', () => {  
    displayTerms();  
    displayStoreCourses();
    displayStoreAutoCheck();
    requestNotify();
    handleAutoCheck();
});

// Event: Add a Course to List
document.getElementById('course-form').addEventListener('submit', (e) => {
    // Prevent actual submit
    e.preventDefault();

    // Get form values
    const term = document.getElementById('term').value;
    const facc = document.getElementById('facc').value;
    const number = document.getElementById('number').value;
    const code = `${facc}-${number}`;
    const crn = document.getElementById('crn').value;

    // Validate 
    if (term === '' || facc === '' || number === '' || crn === ''){
        showAlert('Please fill in all fields.', 'danger');
    } else{
        // Instantiate Course
        let course = { 
            term : term,
            code: code,
            crn : crn,
        }

        addCourseToList(course);

        addCourseToStore(course);

        showAlert("Course added.", 'success');

        clearFields();
    }
});

// Event : Remove a Course
document.getElementById('course-list').addEventListener('click', (e) => 
{
    if (e.target.classList.contains('delete')){

        removeCourse(e.target);

        removeStoredCourse(e.target.parentElement.previousElementSibling.previousElementSibling.textContent);

        showAlert("Course removed.", 'success');
    }
});

// Event: Automatic Refresh selected
document.getElementById('auto').addEventListener('change', function (event) {
    // Update Automatic Refresh checkbox state in Store
    localStorage.setItem('autoCheck', JSON.stringify(this.checked));

    if (!(this.checked)){ // Prevent setTimeOut from triggering if auto refresh off
        clearTimeout(timeOut);
    }

    handleAutoCheck();  // setTimeOut if auto refresh is checked
});