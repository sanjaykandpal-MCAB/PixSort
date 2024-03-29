import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaGithub, FaFacebook, FaGoogle } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import Validation from "./LoginValidation";
import "../styles/AuthForm.css";
import girlPhoto from "../images/girlPhotoGrapher.jpg";
import axios from "axios";
import logo from "../images/logo.png";

function Login() {
  const [values, setValues] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const handleInput = (event) => {
    setValues((prev) => ({
      ...prev,
      [event.target.name]: [event.target.value],
    }));
  };
  axios.defaults.withCredentials = true;

  useEffect(() => {
    axios
      .get("http://localhost:8081/")
      .then((res) => {
        console.log(res);
        if (res.data.valid == true) {
          navigate("/");
        } else {
          navigate("/Login");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    setErrors(Validation(values));
    if (errors.email === "" && errors.password === "") {
      axios
        .post("http://localhost:8081/login", values)
        .then((res) => {
          console.log(res.data);
          if (res.data.message === true) {
            navigate("/");
          } else {
            alert("Invalid Credentials");
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  return (
    <>
      <img src={logo} id="logo" />

      <div className="flex-container">
        <div className="sidebar-img">
          <img
            src="https://images.unsplash.com/photo-1493863641943-9b68992a8d07?q=80&w=2058&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="photographer Image "
          />
        </div>
        <div className="sidebar-img">
          <img src={girlPhoto} alt="photographer Girl Image" />
        </div>
        <div className="sidebar-main">
          <div className="flex-login">
            <ul
              class="nav nav-pills nav-justified mb-3"
              id="ex1"
              role="tablist"
            >
              <li class="nav-item" role="presentation">
                <a
                  class="nav-link active"
                  id="tab-login"
                  data-mdb-toggle="pill"
                  href="#pills-login"
                  role="tab"
                  aria-controls="pills-login"
                  aria-selected="true"
                >
                  Login
                </a>
              </li>
              <li class="nav-item" role="presentation">
                <a
                  class="nav-link"
                  id="tab-register"
                  data-mdb-toggle="pill"
                  href="#pills-register"
                  role="tab"
                  aria-controls="pills-register"
                  aria-selected="false"
                >
                  Register
                </a>
              </li>
            </ul>

            <form action="" onSubmit={handleSubmit}>
              <div
                class="tab-pane fade show active"
                id="pills-login"
                role="tabpanel"
                aria-labelledby="tab-login"
              >
                <div class="text-center mb-3">
                  <p>Sign in with:</p>
                  <button
                    type="button"
                    className="btn btn-link btn-floating mx-1"
                  >
                    <FaFacebook size={30} color="blue" />
                  </button>

                  <button
                    type="button"
                    className="btn btn-link btn-floating mx-1"
                  >
                    <FaGoogle size={30} color="#4285F4" />
                  </button>

                  <button
                    type="button"
                    className="btn btn-link btn-floating mx-1"
                  >
                    <FaXTwitter size={30} color="#1DA1F2" />
                  </button>

                  <button
                    type="button"
                    className="btn btn-link btn-floating mx-1"
                  >
                    <i>
                      <FaGithub size={30} color="black" />
                    </i>
                  </button>
                </div>
                <p class="text-center">or:</p>
              </div>
              <div className="form-outline mb-4">
                <label htmlFor="email" className="form-label">
                  <strong>Email</strong>
                </label>
                <input
                  type="email"
                  placeholder="Enter Email"
                  name="email"
                  onChange={handleInput}
                  className="form-control"
                />
                {errors.email && <span className="">{errors.email}</span>}
              </div>
              <div className="form-outline mb-4">
                <label htmlFor="password" className="form-label">
                  <strong>Password</strong>
                </label>
                <input
                  type="password"
                  placeholder="Enter Password"
                  name="password"
                  onChange={handleInput}
                  className="form-control"
                />
                {errors.password && <span className="">{errors.password}</span>}
              </div>
              <button
                type="submit"
                className="w-100 btn btn-primary btn-block mb-3"
              >
                Sign In
              </button>

              <div class="form-check d-flex justify-content-center mb-4">
                <input
                  class="form-check-input me-2"
                  type="checkbox"
                  value=""
                  id="registerCheck"
                  checked
                  aria-describedby="registerCheckHelpText"
                />
                <label class="form-check-label w-100" for="registerCheck">
                  I have read and agree to the terms
                </label>
              </div>
            </form>
            {/* <!-- Register buttons --> */}
            <div class="text-center">
              <p>
                Not a member? <Link to="/signup">Create Account</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export default Login;
