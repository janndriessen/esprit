<?php

/**
 * Plugin Name: Esprit Pay
 * Plugin URI: https://www.lingpay.io
 * Author Name: The Esprit Team
 * Author URI: 
 * Description: Enable payments with 0% transaction fees and feeless bank deposits. Accepts payments from anyone with a Web3 wallet. Supports USD, EUR, GBP, AUD, CAD, and TWD.
 * Version: 0.1.0
 * License: 0.1.0
 * License URL: http://www.gnu.org/licenses/gpl-2.0.txt
 * text-domain: esprit-plugin-domain
*/ 

// function custom_css() {
//     $plugin_url = plugin_dir_url(__FILE__);
//     wp_enqueue_style('style', $plugin_url."style.css");
// }

if ( ! in_array( 'woocommerce/woocommerce.php', apply_filters( 'active_plugins', get_option( 'active_plugins' ) ) ) ) return;

add_action( 'plugins_loaded', 'my_gateway_init', 11 );

// $txt = "PHP";
// // echo "I love $txt!";
// echo "<script> console.log('test')</script>";

function my_gateway_init() {
    if( class_exists( 'WC_Payment_Gateway' ) ) {
        class WC_My_Gateway extends WC_Payment_Gateway {
            public function __construct() {
                $this->id                   = 'esprit_pay';
                $this->icon                 = apply_filters( 'esprit_pay_icon', plugins_url('/assets/logosmall.svg', __FILE__ ) );
                $this->has_fields           = false;
                $this->method_title         = 'Esprit Pay';
                $this->method_description   = 'Accept payment from anyone with a Web3 wallet. Supports bank deposits in <b>USD</b>, <b>EUR</b>, <b>GBP</b>, <b>AUD</b>, <b>CAD</b>, and <b>TWD</b>';
                $this->title                = $this->get_option( 'title' );
                $this->description          = ''; // do I need to declare or can I delete?
                $this->instructions         = $this->get_option( 'instructions' );
                $this->evmaddress           = $this->get_option( 'evmaddress' );
                $this->init_form_fields();
                $this->init_settings();

                add_action( 'wp_enqueue_scripts', function() {
                    global $woocommerce;  
                    $cart_order_total = $woocommerce->cart->total;
                    wp_enqueue_style('style',  plugin_dir_url(__FILE__)."src/style.css", [], "1.6");
                    // $script_path = plugin_dir_url(__FILE__)."src/index.js";
                    $script_path = plugin_dir_url(__FILE__)."build/index.js";
                    wp_register_script('script_handler', $script_path, [], "1.6", true); // change version if script cached and loading old script
                    wp_localize_script('script_handler', 'data', [
                        'amount' => $cart_order_total,
                        'address' => $this->evmaddress,
                    ]);
                    wp_enqueue_script('script_handler', plugin_dir_url(__FILE__)."build/index.js", [], "1.6", true);
                });

                add_filter('woocommerce_gateway_description', function($description, $payment_id) {
                    // echo $payment_id;
                    if ($payment_id === 'esprit_pay') {
                        ob_start();
                        echo '<div class="esprit-container"></div>';
                        $description = ob_get_clean();
                        return $description;
                    } else {
                        return $description;
                    }
                }, 20, 2 );

                add_action( 'woocommerce_update_options_payment_gateways_' . $this->id, array( $this, 'process_admin_options' ) );
                add_action( 'woocommerce_thank_you_' . $this->id, array( $this, 'thank_you_page' ) );
            }

            public function init_form_fields() {
                $this->form_fields = apply_filters( 'esprit_pay_fields', array(
                    'enabled' => array(
                        'title' => 'Enable Esprit Pay',
                        'type' => 'checkbox',
                        'label' => ' ',
                        'default' => 'no'
                    ),
                    'title' => array(
                        'title' => 'Payment Title',
                        'type' => 'text',
                        'default' => 'Esprit Pay',
                        'desc_tip' => false,
                        'description' => __( 'This title will appear in the list of payment options in the checkout page', 'esprit-plugin-domain')
                    ),
                    'evmaddress' => array(
                        'title' => __( 'Your EVM Address', 'esprit-plugin-domain'),
                        'type' => 'text',
                        'default' => __( '0x...'),
                        'desc_tip' => false,
                        'description' => __( 'Copy and paste over the EVM Address from your Esprit Account', 'esprit-plugin-domain')
                    ),
                    'instructions' => array(
                        'title' => __( 'Instructions', 'esprit-plugin-domain'),
                        'type' => 'textarea',
                        'default' => __( 'Default instructions', 'esprit-plugin-domain'),
                        'desc_tip' => true,
                        'description' => __( 'Instructions that will be added to the thank you page and order email', 'esprit-plugin-domain')
                    ),
                ));
            }

            public function process_payment( $order_id ) {
                $order = wc_get_order( $order_id );
        
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

            // // thank you page // //
            // cod version
            public function thank_you_page() {
                if ( $this->instructions ) {
                    echo wp_kses_post( wpautop( wptexturize( $this->instructions ) ) );
                }
            }
            // youtube version
            // public function thank_you_page(){
            //     if( $this->instructions ){
            //         echo wpautop( $this->instructions );
            //     }
            // }
        }
    }
}

add_filter( 'woocommerce_payment_gateways', 'add_my_gateway');

function add_my_gateway( $gateways ) {
    $gateways[] = 'WC_My_Gateway';
    return $gateways;
}