function validateForm() {

    var fname = document.getElementById("fname").value;
    var lname = document.getElementById("lname").value;
    var password = document.getElementById("password").value;
    var email = document.getElementById("email").value;
    var mobile = document.getElementById("mobile").value;
    var address = document.getElementById("address").value;

    var namePattern = /^[A-Za-z]+$/;
    var emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    var mobilePattern = /^[0-9]{10}$/;

    if (!namePattern.test(fname) || fname.length < 6) {
        alert("First Name must contain only alphabets and minimum 6 characters");
        return false;
    }

    if (password.length < 6) {
        alert("Password must be at least 6 characters long");
        return false;
    }

    if (!emailPattern.test(email)) {
        alert("Invalid Email format");
        return false;
    }

    if (!mobilePattern.test(mobile)) {
        alert("Mobile Number must contain exactly 10 digits");
        return false;
    }

    if (lname === "") {
        alert("Last Name should not be empty");
        return false;
    }

    if (address === "") {
        alert("Address should not be empty");
        return false;
    }

    alert("Registration Successful!");
    return true;
}
