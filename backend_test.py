#!/usr/bin/env python3
"""
AquaFax Water Quality Scanner - Backend API Testing
Tests all backend endpoints for the water quality scanner app
"""

import requests
import sys
import json
from datetime import datetime
from typing import Dict, Any

class AquaFaxAPITester:
    def __init__(self, base_url="https://trust-verify-51.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        result = {
            "test_name": name,
            "success": success,
            "details": details,
            "response_data": response_data,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {name}")
        if details:
            print(f"    {details}")
        if not success and response_data:
            print(f"    Response: {response_data}")

    def test_api_root(self):
        """Test API root endpoint"""
        try:
            response = requests.get(f"{self.api_url}/", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                expected_message = "AquaFax Water Quality Scanner API"
                if data.get("message") == expected_message:
                    self.log_test("API Root Endpoint", True, f"Status: {response.status_code}, Message: {data.get('message')}")
                else:
                    self.log_test("API Root Endpoint", False, f"Unexpected message: {data.get('message')}", data)
            else:
                self.log_test("API Root Endpoint", False, f"Status: {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("API Root Endpoint", False, f"Connection error: {str(e)}")

    def test_get_brands(self):
        """Test getting water brands"""
        try:
            response = requests.get(f"{self.api_url}/brands", timeout=10)
            success = response.status_code == 200
            
            if success:
                brands = response.json()
                if isinstance(brands, list) and len(brands) > 0:
                    # Check if we have the expected sample brands
                    brand_names = [brand.get('brand_name') for brand in brands]
                    expected_brands = ['Fiji', 'Evian', 'Dasani', 'Aquafina']
                    found_brands = [name for name in expected_brands if name in brand_names]
                    
                    self.log_test("Get Water Brands", True, 
                                f"Found {len(brands)} brands, including: {', '.join(found_brands[:3])}")
                    return brands
                else:
                    self.log_test("Get Water Brands", False, "No brands returned or invalid format", brands)
            else:
                self.log_test("Get Water Brands", False, f"Status: {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Get Water Brands", False, f"Connection error: {str(e)}")
        
        return []

    def test_scan_water_valid_barcode(self, barcode="012345678901"):
        """Test scanning water with valid barcode"""
        try:
            payload = {"barcode": barcode}
            response = requests.post(f"{self.api_url}/scan", json=payload, timeout=30)
            success = response.status_code == 200
            
            if success:
                scan_result = response.json()
                required_fields = ['id', 'barcode', 'brand_name', 'product_name', 'quality_score', 
                                 'report_summary', 'detailed_report', 'contaminants', 'compliance', 'timestamp']
                
                missing_fields = [field for field in required_fields if field not in scan_result]
                
                if not missing_fields:
                    # Validate data types and ranges
                    score = scan_result.get('quality_score', 0)
                    if 0 <= score <= 100:
                        self.log_test("Scan Water - Valid Barcode", True, 
                                    f"Brand: {scan_result.get('brand_name')}, Score: {score}")
                        return scan_result
                    else:
                        self.log_test("Scan Water - Valid Barcode", False, 
                                    f"Invalid quality score: {score}", scan_result)
                else:
                    self.log_test("Scan Water - Valid Barcode", False, 
                                f"Missing fields: {missing_fields}", scan_result)
            else:
                self.log_test("Scan Water - Valid Barcode", False, 
                            f"Status: {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Scan Water - Valid Barcode", False, f"Error: {str(e)}")
        
        return None

    def test_scan_water_invalid_barcode(self):
        """Test scanning water with invalid barcode"""
        try:
            payload = {"barcode": "999999999999"}
            response = requests.post(f"{self.api_url}/scan", json=payload, timeout=10)
            success = response.status_code == 404
            
            if success:
                error_data = response.json()
                self.log_test("Scan Water - Invalid Barcode", True, 
                            f"Correctly returned 404: {error_data.get('detail', 'No detail')}")
            else:
                self.log_test("Scan Water - Invalid Barcode", False, 
                            f"Expected 404, got {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Scan Water - Invalid Barcode", False, f"Error: {str(e)}")

    def test_multiple_sample_barcodes(self):
        """Test all sample barcodes from the requirements"""
        sample_barcodes = [
            "012345678901",  # Fiji
            "012345678902",  # Evian  
            "012345678903",  # Dasani
            "012345678904",  # Aquafina
            "012345678905",  # Poland Spring
            "012345678906",  # Smartwater
            "012345678907",  # Voss
            "012345678908"   # Nestle Pure Life
        ]
        
        successful_scans = 0
        for barcode in sample_barcodes:
            try:
                payload = {"barcode": barcode}
                response = requests.post(f"{self.api_url}/scan", json=payload, timeout=30)
                
                if response.status_code == 200:
                    scan_result = response.json()
                    brand_name = scan_result.get('brand_name', 'Unknown')
                    score = scan_result.get('quality_score', 0)
                    successful_scans += 1
                    print(f"    ✅ {barcode} -> {brand_name} (Score: {score})")
                else:
                    print(f"    ❌ {barcode} -> Failed ({response.status_code})")
                    
            except Exception as e:
                print(f"    ❌ {barcode} -> Error: {str(e)}")
        
        success = successful_scans == len(sample_barcodes)
        self.log_test("All Sample Barcodes", success, 
                    f"{successful_scans}/{len(sample_barcodes)} barcodes working")

    def test_get_scan_history(self):
        """Test getting scan history"""
        try:
            response = requests.get(f"{self.api_url}/history", timeout=10)
            success = response.status_code == 200
            
            if success:
                history = response.json()
                if isinstance(history, list):
                    self.log_test("Get Scan History", True, 
                                f"Retrieved {len(history)} scan records")
                    return history
                else:
                    self.log_test("Get Scan History", False, "Invalid history format", history)
            else:
                self.log_test("Get Scan History", False, f"Status: {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Get Scan History", False, f"Error: {str(e)}")
        
        return []

    def test_ai_report_generation(self):
        """Test AI report generation quality"""
        try:
            # Scan a water bottle to trigger AI report generation
            payload = {"barcode": "012345678901"}  # Fiji
            response = requests.post(f"{self.api_url}/scan", json=payload, timeout=45)
            
            if response.status_code == 200:
                scan_result = response.json()
                
                # Check if AI-generated fields are present and meaningful
                detailed_report = scan_result.get('detailed_report', '')
                contaminants = scan_result.get('contaminants', {})
                compliance = scan_result.get('compliance', {})
                
                ai_quality_checks = []
                
                # Check detailed report quality
                if len(detailed_report) > 100:
                    ai_quality_checks.append("Detailed report generated")
                
                # Check contaminants data
                required_contaminants = ['lead_ppb', 'pfas_ppt', 'microplastics', 'disinfection_byproducts']
                if all(key in contaminants for key in required_contaminants):
                    ai_quality_checks.append("Contaminants analysis complete")
                
                # Check compliance data
                required_compliance = ['epa_compliant', 'ewg_rating', 'state_compliant']
                if all(key in compliance for key in required_compliance):
                    ai_quality_checks.append("Compliance analysis complete")
                
                success = len(ai_quality_checks) >= 2
                self.log_test("AI Report Generation", success, 
                            f"Quality checks passed: {', '.join(ai_quality_checks)}")
            else:
                self.log_test("AI Report Generation", False, 
                            f"Scan failed with status: {response.status_code}")
                
        except Exception as e:
            self.log_test("AI Report Generation", False, f"Error: {str(e)}")

    def run_all_tests(self):
        """Run comprehensive backend API tests"""
        print("🧪 Starting AquaFax Backend API Tests")
        print("=" * 50)
        
        # Basic connectivity tests
        self.test_api_root()
        self.test_get_brands()
        
        # Core functionality tests
        self.test_scan_water_valid_barcode()
        self.test_scan_water_invalid_barcode()
        self.test_multiple_sample_barcodes()
        
        # History and data persistence
        self.test_get_scan_history()
        
        # AI integration tests
        self.test_ai_report_generation()
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All backend tests PASSED!")
            return True
        else:
            failed_tests = [result for result in self.test_results if not result['success']]
            print(f"❌ {len(failed_tests)} tests FAILED:")
            for test in failed_tests:
                print(f"   - {test['test_name']}: {test['details']}")
            return False

def main():
    """Main test execution"""
    tester = AquaFaxAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump({
            'summary': {
                'total_tests': tester.tests_run,
                'passed_tests': tester.tests_passed,
                'success_rate': f"{(tester.tests_passed/tester.tests_run*100):.1f}%" if tester.tests_run > 0 else "0%",
                'timestamp': datetime.now().isoformat()
            },
            'detailed_results': tester.test_results
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())