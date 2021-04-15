package com.example.demo.service;

import com.example.demo.dao.ProductRepository;
import com.example.demo.entity.Product;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
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

    @Transactional
    public void deleteProduct(Product p)
    {
        productRepository.deleteProductByID(p.getId());
    }

    @Transactional
    public void addNewProduct(Product p)
    {
        productRepository.insertUser(p.getProductName(), p.getNumber(), p.getPrice(), p.getCost(), p.getSupplier(), p.getListedDate(), true);
    }
    
}
