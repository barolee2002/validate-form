function Validator(options) {
  function getParent(element, selector) {
    while (element.parentElement) {
      if (element.parentElement.matches(selector)) {
        return element.parentElement;
      }
      element = element.parentElement;
    }
  }

  var selectorRules = {};
  function validate(inputElement, rule) {
    var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
    var errorMessage;
    var rules = selectorRules[rule.selector];
    for (var i = 0; i < rules.length; ++i) {
      errorMessage = rules[i](inputElement.value)
      if (errorMessage) break
    }
    if (errorMessage) {
      errorElement.innerText = errorMessage;
      getParent(inputElement, options.formGroupSelector).classList.add('invalid');
    } else {
      errorElement.innerText = '';
      getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
    }
    return !errorMessage
  }
  var formElement = document.querySelector(options.form);
  if (formElement) {
    formElement.onsubmit = function (e) {
      e.preventDefault();

      var isFormValid = true;
      options.rules.forEach(function (rule) {
        var inputElement = formElement.querySelector(rule.selector);
        var isValid = validate(inputElement, rule);
        if (!isValid) {
          isFormValid = false;
        }
      });
      if (isFormValid) {
        if (typeof options.onSubmit === 'function') {
          
          var enableInput = formElement.querySelectorAll('[name]')
          var formValue = Array.from(enableInput).reduce(function (values, input) {
            return (values[input.name] = input.value) && values
          }, {})
          options.onSubmit(formValue)
        }
      } else {
        console.log('Có lỗi');

      }
    }
    options.rules.forEach(function (rule) {
      if (Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector].push(rule.test);
      } else {
        selectorRules[rule.selector] = [rule.test];
      }

      var inputElements = formElement.querySelectorAll(rule.selector);

      Array.from(inputElements).forEach(function (inputElement) {
        inputElement.onblur = function () {
          validate(inputElement, rule);
        }
        inputElement.oninput = function () {
          var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
          errorElement.innerText = '';
          getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
        }
      });
    });
  }

}
Validator.isRequired = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      return value.trim() ? undefined : message || 'Vui lòng nhập trường này'
    }
  };
}

Validator.isEmail = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regex.test(value) ? undefined : message || 'Trường này phải là email';
    }
  };
}
const checkCharactor  = (str) =>{
  let upperCase = false
  let lowerCase = false
  for (var i = 0; i < str.length; i++) {
    if(str[i] === str[i].toUpperCase()) {
      upperCase = true;
    }
    if(str[i] === str[i].toLowerCase()) {
      lowerCase = true;
    }
  }
  return upperCase === false | lowerCase === false ? false : true
}
const checkLength = (str) => {
  if(str.length >= 8 && str.length <=32) {
    return true;
  } else {return false}
}
Validator.isPassword = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      return checkLength(value)&&checkCharactor(value) ? undefined :message || `Password có từ 8-32 kí tự, ít nhất 1 chữ hoa và 1 chữ thường`;
    }
  };
}

Validator.isConfirmed = function (selector, getConfirmValue, message) {
  return {
    selector: selector,
    test: function (value) {
      
      return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác';
    }
  }
}