package com.example.demo.service;

import com.example.demo.dao.ProductRepository;
import com.example.demo.entity.Product;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.awt.print.Pageable;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;

@Service
public class DemoService {

    @Autowired
    private ProductRepository productRepository;

    public List<Product> generateAllInfo()
    {
        List<Product> pList = productRepository.findAllProduct();
        return pList;
    }


}
