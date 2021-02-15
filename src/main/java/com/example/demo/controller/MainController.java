package com.example.demo.controller;


import com.example.demo.dao.ProductRepository;
import com.example.demo.entity.Product;

import com.example.demo.entity.UserInfo;
import com.example.demo.service.DemoService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@Controller
@RequestMapping(value = "${server.context-path}")
@Slf4j
public class MainController {
    @Autowired(required = true)
    private DemoService demoService;

    @RequestMapping(value = "/getProducts", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE,
            consumes = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public List<Product> getProducts() throws IOException {
        return demoService.generateAllInfo();
    }

    @RequestMapping(value = "/index", method = RequestMethod.GET)
    public String index(ModelMap modelMap) {
        modelMap.put("msg", "SpringBoot Ajax Sample");
        return "index";
    }

    @RequestMapping(value = "/chat", method = RequestMethod.GET)
    public String chat(ModelMap modelMap) {
        modelMap.put("msg", "SpringBoot Ajax Sample");
        return "chat";
    }

    @RequestMapping(value = "/main", method = RequestMethod.GET)
    public String main(ModelMap modelMap) {
        modelMap.put("msg", "SpringBoot Ajax Sample");
        return "main";
    }

    @RequestMapping(value = "/loop", method = RequestMethod.GET)
    public String loop(ModelMap modelMap) {
        modelMap.put("msg", "SpringBoot Ajax Sample");
        return "loop";
    }

}