<?php

/**
 * Plugin Name: Flash Pay
 * Plugin URI: https://www.lingpay.io
 * Author Name: The Flash Team
 * Author URI: 
 * Description: Enable payments with 0% transaction fees and feeless bank deposits. Accepts payments from anyone with a Web3 wallet. Supports USD, EUR, GBP, AUD, CAD, and TWD.
 * Version: 0.1.0
 * License: 0.1.0
 * License URL: http://www.gnu.org/licenses/gpl-2.0.txt
 * text-domain: checkout-plugin-flash-woo
*/ 

// function custom_css() {
//     $plugin_url = plugin_dir_url(__FILE__);
//     wp_enqueue_style('style', $plugin_url."style.css");
// }

if ( ! in_array( 'woocommerce/woocommerce.php', apply_filters( 'active_plugins', get_option( 'active_plugins' ) ) ) ) return;

add_action( 'plugins_loaded', 'flash_pay_init', 11 );

// $txt = "PHP";
// // echo "I love $txt!";
// echo "<script> console.log('test')</script>";

function flash_pay_init() {
    if( class_exists( 'WC_Payment_Gateway' ) ) {
        class WC_Flash_Pay_Gateway extends WC_Payment_Gateway {
            public function __construct() {
                $this->id                   = 'flash_pay';
                $this->icon                 = apply_filters( 'flash_pay_icon', plugins_url('/assets/icon.png', __FILE__ ) );
                $this->has_fields           = false;
                $this->method_title         = 'Flash Pay';
                $this->method_description   = 'Accept payment from anyone with a Web3 wallet. Supports bank deposits in <b>USD</b>, <b>EUR</b>, <b>GBP</b>, <b>AUD</b>, <b>CAD</b>, and <b>TWD</b>';
                $this->title                = $this->get_option( 'title' );
                $this->description          = $this->get_option( 'description' );
                $this->instructions         = $this->get_option( 'instructions' );
                $this->evmaddress           = $this->get_option( 'evmaddress' );
                $this->init_form_fields();
                $this->init_settings();

                add_action( 'woocommerce_update_options_payment_gateways_' . $this->id, array( $this, 'process_admin_options' ) );
                add_action( 'woocommerce_thank_you_' . $this->id, array( $this, 'thank_you_page' ) );
            }

            public function init_form_fields() {
                $this->form_fields = apply_filters( 'flash_pay_fields', array(
                    'enabled' => array(
                        'title' => 'Enable Flash Pay',
                        'type' => 'checkbox',
                        'label' => ' ',
                        'default' => 'no'
                    ),
                    'title' => array(
                        'title' => 'Payment Title',
                        'type' => 'text',
                        'default' => 'Flash Pay',
                        'desc_tip' => false,
                        'description' => __( 'This title will appear in the list of payment options in the checkout page', 'checkout-plugin-flash-woo')
                    ),
                    'description' => array(
                        'title' => __( 'Payment Description', 'checkout-plugin-flash-woo'),
                        'type' => 'textarea',
                        'default' => __( 'Pay with stablecoins (USDC, USDT, GHO)', 'checkout-plugin-flash-woo'),
                        'desc_tip' => false,
                        'description' => __( 'This description will appear in the checkout page if the user selects Flash Pay', 'checkout-plugin-flash-woo')
                    ),
                    'evmaddress' => array(
                        'title' => __( 'Your EVM Address', 'checkout-plugin-flash-woo'),
                        'type' => 'text',
                        'default' => __( '0x...'),
                        'desc_tip' => false,
                        'description' => __( 'Copy and paste over the EVM Address from your Flash Pay Account', 'checkout-plugin-flash-woo')
                    ),
                    'instructions' => array(
                        'title' => __( 'Instructions', 'checkout-plugin-flash-woo'),
                        'type' => 'textarea',
                        'default' => __( 'Default instructions', 'checkout-plugin-flash-woo'),
                        'desc_tip' => true,
                        'description' => __( 'Instructions that will be added to the thank you page and order email', 'checkout-plugin-flash-woo')
                    ),
                ));
            }

            public function process_payment( $order_id ) {
                $order = wc_get_order( $order_id );

                add_action( 'wp_enqueue_scripts', function() {
                    // $path = "src/index.js";
                    $path = "build/index.js";
                    $style_path = "src/style.css";
                    wp_register_script('first', plugin_dir_url(__FILE__) . $path, [], '1.0', true);
                    wp_localize_script('first', 'data', [
                        'amount' => '1',
                        'address' => '0x123',
                    ]);
                    wp_enqueue_style('style', plugin_dir_url(__FILE__) . $style_path);
                    wp_enqueue_script('first', plugin_dir_url(__FILE__) . $path, [], '1.0', true);
                });
              
                // get request every 2 seconds for total 60s
                sleep(30);
        
                if ( $order->get_total() > 0 ) {
                    $order->update_status( 'processing', __( 'Payment to be made upon delivery.', 'woocommerce' ) );
                } else {
                    $order->payment_complete();
                }

                wc_reduce_stock_levels($order_id);
        
                // Remove cart.
                WC()->cart->empty_cart();
        
                // Return thankyou redirect.
                return array(
                    'result'   => 'success',
                    'redirect' => $this->get_return_url( $order ),
                );
            }

            // cod version
            public function thank_you_page() {
                if ( $this->instructions ) {
                    echo wp_kses_post( wpautop( wptexturize( $this->instructions ) ) );
                }
            }

            // public function clear_payment_with_api() {
            // }

            // public function thank_you_page(){
            //     if( $this->instructions ){
            //         echo wpautop( $this->instructions );
            //     }
            // }

        }
    }
}

add_filter( 'woocommerce_payment_gateways', 'add_flash_pay_gateway');

function add_flash_pay_gateway( $gateways ) {
    $gateways[] = 'WC_Flash_Pay_Gateway';
    return $gateways;
}