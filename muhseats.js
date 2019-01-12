/* 
FULL CREDIT to Jennings Zhang, the meemer himself, for figuring out VSB
https://gitlab.com/snippets/1786103

check him out
https://jennydaman.gitlab.io/
*/

class Course{
    constructor(term, code, crn){
        this.term = term;
        this.code = code;
        this.crn = crn;
    }
}

class UI {
    static displayTerms(){ //Display all possible terms
        let el = document.querySelector('#term');
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
        document.querySelector('#term').querySelector(`option[value="${today.getFullYear()}${selterm}"]`).setAttribute("selected", "selected");
    }

    static displayCourses(){ // Displays Courses from previous sessions
        const courses = Store.getCourses();

        courses.forEach((course) => {
            UI.addCourseToList(course);
        });
    }
    static async addCourseToList(course){
        // Create HTML Element for the Course, row in list, without number of seats
        let list = document.querySelector('#course-list');
        let row = document.createElement('tr');
        let termtxt = document.querySelector('#term').options[document.querySelector('#term').selectedIndex].text;
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
        const seats = await new Promise((resolve,reject) =>{
            let url = `https://vsb.mcgill.ca/vsb/getclassdata.jsp?term=${course.term}&course_0_0=${course.code}&rq_0_0=null${this.nWindow()}&nouser=1`;
            let xhr = new XMLHttpRequest();
            xhr.responseType = 'document';
            xhr.open('GET', 'https://cors-anywhere.herokuapp.com/' + url, true);
            xhr.onload = function () {
                try{
                    let xml = xhr.responseXML.querySelector('classdata').querySelector('course').querySelectorAll('uselection');
                    for (let i = 0; i < xml.length; i++){
                        let section = xml[i].querySelector('selection').querySelectorAll('block');
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
        row.querySelector("#seats").innerHTML = `${seats}`;
    }
    static nWindow() { //weird useless security attempt to get url for vsb
        var f8b0=["\x26\x74\x3D","\x26\x65\x3D"];
        var t=(Math.floor((new Date())/60000))%1000;
        var e=t%3+t%19+t%42;
        return f8b0[0]+t+f8b0[1]+e;
    }

    static deleteCourse(el){
        el.parentElement.parentElement.remove();
    }
    static showAlert(message, className){
        const div = document.createElement('div');
        div.className = `alert alert-${className}`;
        div.appendChild(document.createTextNode(message));
        const container = document.querySelector('.container');
        const form = document.querySelector('#course-form');
        container.insertBefore(div, form);

        // Vanish in 3 seconds
        setTimeout(() => document.querySelector('.alert').remove(), 3000);
    }

    static clearFields(){
        document.querySelector('#term').value = '';
        document.querySelector('#facc').value = '';
        document.querySelector('#number').value = '';
        document.querySelector('#crn').value = '';
    }
}

class Store { // Local Storage
    static getCourses(){
        let courses;
        if (localStorage.getItem('courses') === null){
            courses = [];
        }
        else{
            courses = JSON.parse(localStorage.getItem('courses'));
        }

        return courses;
    }

    static addCourse(course){
        const courses = Store.getCourses();
        courses.push(course);

        localStorage.setItem('courses', JSON.stringify(courses));
    }

    static removeCourse(crn){
        const courses = Store.getCourses();
        courses.forEach((book, index) => {
            if(book.crn === crn){
                courses.splice(index, 1);
            }
        });
        localStorage.setItem('courses', JSON.stringify(courses));
    }
}

// Event: Display all possible Terms, and Courses from previous session
document.addEventListener('DOMContentLoaded', () => {  
    UI.displayTerms();  
    UI.displayCourses();

    setTimeout(() => alert("dicks"), 5000);
});

// Event: Add a Course to List
document.querySelector('#course-form').addEventListener('submit', (e) => {
    // Prevent actual submit
    e.preventDefault();

    // Get form values
    const term = document.querySelector('#term').value;
    const facc = document.querySelector('#facc').value;
    const number = document.querySelector('#number').value;
    const code = `${facc}-${number}`;
    const crn = document.querySelector('#crn').value;

    // Validate 
    if (term === '' || facc === '' || number === '' || crn === ''){
        UI.showAlert('Please fill in all fields.', 'danger');
    } else{
        const course = new Course(term, code, crn);

        UI.addCourseToList(course);

        Store.addCourse(course);

        UI.showAlert("Course added.", 'success');

        UI.clearFields();
    }
});

// Event : Remove a Course
document.querySelector('#course-list').addEventListener('click', (e) => 
{
    if (e.target.classList.contains('delete')){

        UI.deleteCourse(e.target);

        Store.removeCourse(e.target.parentElement.previousElementSibling.previousElementSibling.textContent);

        UI.showAlert("Course removed.", 'success');
    }
});